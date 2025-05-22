<?php

namespace App\Controller\ChatBot;

use App\Entity\Appointment;
use App\Entity\Operations;
use App\Service\ChatbotMessageService;
use App\Service\GarageFinderService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class RendezVousController extends AbstractController
{
    public function __construct(
        private readonly ChatbotMessageService   $chatbotMessage,
        private readonly GarageFinderService     $garageFinder,
        private readonly EntityManagerInterface  $em
    ) {}

    #[Route('/api/chatbot/rendezvous', name: 'api_chatbot_rendezvous', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $message = trim($payload['message'] ?? '');
        $context = $payload['context'] ?? ['stage' => 'init', 'data' => []];
        $stage   = $context['stage'];
        $data    = $context['data'];

        if ($message === '') {
            return $this->json(['error' => 'Message manquant.'], 400);
        }

        $assistant = [
            'questions'    => [],
            'alternatives' => [],
            'confirmation' => null,
        ];

        switch ($stage) {
            case 'init':
                $assistant['questions']    = ['Bonjour, avez-vous un problème avec votre voiture ?'];
                $assistant['alternatives'] = ['Oui', 'Non'];
                $nextStage = 'awaiting_problem_confirmation';
                break;

            case 'awaiting_problem_confirmation':
                $msg = strtolower($message);
                if (in_array($msg, ['oui', 'yes', 'ok'])) {
                    $assistant['questions'] = ['Pouvez-vous décrire votre problème en quelques mots ?'];
                    $nextStage = 'awaiting_problem_description';
                    break;
                } elseif (in_array($msg, ['non', 'no'])) {
                    $assistant['questions'] = ['Très bien ! N\'hésitez pas à revenir si besoin.'];
                    $nextStage = 'finished';
                    break;
                } else {
                    $stage = 'awaiting_problem_description';
                }
                // fallthrough

            case 'awaiting_problem_description':
                try {
                    $opsData = $this->chatbotMessage->resolve($message);

                    if (!empty($opsData['operation'])) {
                        $data['operation'] = $opsData['operation'];
                        $assistant['questions'] = ['Souhaitez-vous que je vous propose un garage proche ?'];
                        $assistant['alternatives'] = ['Oui', 'Non'];
                        $nextStage = 'awaiting_garage_confirmation';
                    } else {
                        $assistant['questions'] = $opsData['questions'] ?? ['Pouvez-vous être plus précis ?'];
                        $assistant['alternatives'] = $opsData['alternatives'] ?? [];
                        $nextStage = 'awaiting_problem_description';
                    }
                } catch (\Throwable $e) {
                    return $this->json(['error' => 'Erreur GPT : ' . $e->getMessage()], 500);
                }
                break;

            case 'awaiting_garage_confirmation':
                $msg = strtolower($message);
                $shouldSearch = in_array($msg, ['oui', 'yes', 'ok']) || preg_match('/\d{2,}.*(rue|avenue|boulevard|place|allée|impasse|chemin|route)/i', $message);

                if ($shouldSearch) {
                    try {
                        $userId = $this->getUser()?->getId();
                        $garageData = $this->garageFinder->findNearestGarages($message, $userId);

                        if ($garageData['error']) {
                            return $this->json(['reply' => $garageData['reply']], $garageData['status']);
                        }

                        $garageNames = array_map(fn($g) => $g['name'], $garageData['garages']);
                        $data['garages'] = $garageData['garages'];

                        $assistant['questions'] = ['Voici les garages proches. Lequel choisissez-vous ?'];
                        $assistant['alternatives'] = $garageNames;
                        $nextStage = 'awaiting_garage_choice';
                    } catch (\Throwable $e) {
                        return $this->json(['error' => 'Erreur service garage : ' . $e->getMessage()], 500);
                    }
                } else {
                    $assistant['questions'] = ['Très bien. À quelle date et heure souhaitez-vous le rendez-vous ? (YYYY-MM-DD HH:MM)'];
                    $nextStage = 'awaiting_datetime';
                }
                break;

            case 'awaiting_garage_choice':
                $data['garage'] = $message;
                $assistant['questions'] = ['Parfait. Quelle date et heure vous conviendraient ? (YYYY-MM-DD HH:MM)'];
                $nextStage = 'awaiting_datetime';
                break;

            case 'awaiting_datetime':
                $data['datetime'] = $message;

                $user = $this->getUser();
                if (!$user) {
                    return $this->json(['error' => 'Utilisateur non connecté.'], 401);
                }

                $dateTime = \DateTime::createFromFormat('Y-m-d H:i', $data['datetime']);
                if (!$dateTime) {
                    return $this->json(['error' => 'Format de date invalide.'], 400);
                }

                $operationEntity = $this->em
                    ->getRepository(Operations::class)
                    ->findOneBy(['name' => $data['operation']]);

                if (!$operationEntity) {
                    return $this->json(['error' => 'Opération inconnue : ' . $data['operation']], 404);
                }

                $appointment = new Appointment();
                $appointment->setUser($user);
                $appointment->setOperation($operationEntity);
                $appointment->setGarage($data['garage'] ?? 'Non spécifié');
                $appointment->setScheduledAt($dateTime);

                $this->em->persist($appointment);
                $this->em->flush();

                $assistant['confirmation'] = sprintf(
                    "✅ Rendez-vous confirmé pour l’opération « %s » %s le %s.",
                    $operationEntity->getName(),
                    $appointment->getGarage() ? 'chez « ' . $appointment->getGarage() . ' »' : '',
                    $dateTime->format('d/m/Y H:i')
                );
                $nextStage = 'finished';
                break;

            default:
                $assistant['questions'] = ['Conversation terminée.'];
                $nextStage = 'finished';
                break;
        }

        return $this->json([
            'context' => [
                'stage' => $nextStage,
                'data'  => $data,
            ],
            'assistant' => array_filter($assistant),
        ]);
    }
}
