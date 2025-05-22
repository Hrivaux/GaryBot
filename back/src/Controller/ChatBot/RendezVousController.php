<?php

namespace App\Controller\ChatBot;

use App\Entity\Appointment;
use App\Entity\Operations;
use App\Entity\Concessions;
use App\Entity\Vehicle;
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
        $address = trim($payload['address'] ?? '');
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
                if (in_array(strtolower($message), ['oui', 'yes'])) {
                    $assistant['questions'] = ['Pouvez-vous décrire votre problème ?'];
                    $nextStage = 'awaiting_problem_description';
                } else {
                    $assistant['questions'] = ['Très bien ! N\'hésitez pas à revenir si besoin.'];
                    $nextStage = 'finished';
                }
                break;

            case 'awaiting_problem_description':
                try {
                    $opsData = $this->chatbotMessage->resolve($message);
                    if (!empty($opsData['operation'])) {
                        $data['operation_candidate'] = $opsData['operation'];
                        $assistant['questions'] = [
                            sprintf("Souhaitez-vous effectuer l'opération suivante : « %s » ?", $opsData['operation'])
                        ];
                        $assistant['alternatives'] = ['Oui', 'Non'];
                        $nextStage = 'awaiting_operation_confirmation';
                    } else {
                        $assistant['questions'] = $opsData['questions'] ?? ['Pouvez-vous être plus précis ?'];
                        $assistant['alternatives'] = $opsData['alternatives'] ?? [];
                        $nextStage = 'awaiting_problem_description';
                    }
                } catch (\Throwable $e) {
                    return $this->json(['error' => 'Erreur GPT : ' . $e->getMessage()], 500);
                }
                break;

            case 'awaiting_operation_confirmation':
                if (strtolower($message) === 'oui') {
                    $data['operation'] = $data['operation_candidate'];
                    unset($data['operation_candidate']);
                    $assistant['questions'] = ['Souhaitez-vous que je vous propose un garage proche ?'];
                    $assistant['alternatives'] = ['Oui', 'Non'];
                    $nextStage = 'awaiting_garage_confirmation';
                } else {
                    unset($data['operation_candidate']);
                    $assistant['questions'] = ['Très bien. Décrivez à nouveau votre problème.'];
                    $nextStage = 'awaiting_problem_description';
                }
                break;

            case 'awaiting_garage_confirmation':
                if (in_array(strtolower($message), ['oui', 'yes'])) {
                    try {
                        $userId = $this->getUser()?->getId();
                        $garageData = $this->garageFinder->findNearestGarages($address ?: $message, $userId);

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
                $data['garage_candidate'] = $message;
                $assistant['questions'] = [
                    sprintf("Souhaitez-vous choisir le garage suivant : « %s » ?", $message)
                ];
                $assistant['alternatives'] = ['Oui', 'Non'];
                $nextStage = 'awaiting_garage_confirmation_final';
                break;

            case 'awaiting_garage_confirmation_final':
                if (strtolower($message) === 'oui') {
                    $data['garage'] = $data['garage_candidate'];
                    unset($data['garage_candidate']);
                    $assistant['questions'] = ['Parfait. Quelle date et heure vous conviendraient ? (YYYY-MM-DD HH:MM)'];
                    $nextStage = 'awaiting_datetime';
                } else {
                    unset($data['garage_candidate']);
                    $assistant['questions'] = ['D’accord. Quel garage souhaitez-vous alors ?'];
                    $assistant['alternatives'] = array_map(fn($g) => $g['name'], $data['garages'] ?? []);
                    $nextStage = 'awaiting_garage_choice';
                }
                break;

            case 'awaiting_datetime':
                $data['datetime'] = $message;
                $user = $this->getUser();
                if (!$user) {
                    return $this->json(['error' => 'Utilisateur non connecté.'], 401);
                }

                $dateTime = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $data['datetime']);
                if (!$dateTime) {
                    return $this->json(['error' => 'Format de date invalide.'], 400);
                }

                $operation = $this->em->getRepository(Operations::class)
                    ->findOneBy(['name' => $data['operation']]);

                if (!$operation) {
                    return $this->json(['error' => 'Opération inconnue : ' . $data['operation']], 404);
                }

                $concession = null;
                if (!empty($data['garage'])) {
                    $concession = $this->em->getRepository(Concessions::class)
                        ->findOneBy(['name' => $data['garage']]);
                }

                $vehicle = $this->em->getRepository(Vehicle::class)->findOneBy(['user' => $user]);
                if (!$vehicle) {
                    return $this->json(['error' => 'Aucun véhicule trouvé pour cet utilisateur.'], 404);
                }

                $appointment = new Appointment();
                $appointment->setUser($user);
                $appointment->setOperation($operation);
                $appointment->setGarage($concession);
                $appointment->setVehicle($vehicle);
                $appointment->setStartTime($dateTime);
                $appointment->setEndTime($dateTime->modify('+1 hour'));

                $this->em->persist($appointment);
                $this->em->flush();

                $assistant['confirmation'] = sprintf(
                    "✅ Rendez-vous confirmé pour l’opération « %s » %s le %s.",
                    $operation->getName(),
                    $concession ? 'chez « ' . $concession->getName() . ' »' : '',
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
