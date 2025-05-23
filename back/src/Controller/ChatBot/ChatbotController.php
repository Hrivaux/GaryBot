<?php

namespace App\Controller\ChatBot;

use App\Entity\Operations;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ChatbotController extends AbstractController
{
    public function __construct(
        private readonly HttpClientInterface     $client,
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('/api/chatbot/message', name: 'api_chatbot_message', methods: ['POST'])]
    public function chatbot(Request $request): JsonResponse
    {
        // 1. Authentification
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté.'], 401);
        }

        // 2. Lecture du message
        $data    = json_decode($request->getContent(), true);
        $message = trim($data['message'] ?? '');
        if ('' === $message) {
            return $this->json(['error' => 'Message manquant.'], 400);
        }

        // 3. Charger le catalogue depuis la BDD
        $ops       = $this->em->getRepository(Operations::class)->findAll();
        $catalogue = array_map(fn(Operations $o) => $o->getName(), $ops);
        $catalogueText = implode("\n", $catalogue);

        // 4. Construire le prompt système pour GPT
        $system = <<<TXT
Tu es un assistant automobile. Tu dois toujours répondre en JSON valide, avec les champs :
{
  "operation": "Nom de l'opération choisie ou null",
  "questions": ["liste", "de", "questions", "..."],
  "alternatives": ["op1","op2",...]
}
Règles à suivre :
1) Si l'utilisateur dit "bonjour", tu réponds par une question de type :
   "Bonjour, avez-vous un problème avec votre voiture ?"
   et tu fournis comme alternatives ["Oui","Non"].
2) Si l'utilisateur répond "Oui", tu poses une question pour qu'il décrive son problème.
3) Si l'utilisateur répond "Non", tu termines poliment la conversation sans proposer d'opération.
4) Si l'utilisateur décrit un problème, tu identifies la meilleure opération dans le catalogue ou tu poses des questions complémentaires.
5) Tu peux proposer jusqu'à 10 alternatives si tu n'arrives pas à choisir une seule.
Catalogue disponible :
$catalogueText
TXT;

        $prompt = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user',   'content' => $message],
        ];

        // 5. Appel à l'API OpenAI
        $response = $this->client->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $_ENV['OPENAI_API_KEY'],
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'model'       => 'gpt-4-turbo',
                'messages'    => $prompt,
                'temperature' => 0.5,
            ],
        ]);

        $result  = $response->toArray(false);
        $content = $result['choices'][0]['message']['content'] ?? '';
        $iaData  = json_decode($content, true);

        // 6. Si GPT renvoie une opération, aller la chercher en BDD pour extraire le prix, etc.
        $opName    = $iaData['operation'] ?? null;
        $operation = null;
        if ($opName) {
    $operation = $this->em->createQueryBuilder()
        ->select('o')
        ->from(Operations::class, 'o')
        ->where('LOWER(o.name) LIKE :name')
        ->setParameter('name', '%' . strtolower($opName) . '%')
        ->setMaxResults(1)
        ->getQuery()
        ->getOneOrNullResult();
}


        // 7. Construire la réponse finale
        if ($operation) {
            // Si on a trouvé l'opération en BDD, on renvoie ses détails
            $responseData = [
                'operation'          => $operation->getName(),
                'price'              => $operation->getPrice(),
                'time_unit'          => $operation->getTimeUnit(),
                'additional_help'    => $operation->getAdditionnalHelp(),
                'additional_comment' => $operation->getAdditionnalComment(),
                'questions'          => $iaData['questions']    ?? [],
                'alternatives'       => [],  // plus d'alternatives si l'opération est confirmée
            ];
        } else {
            // Sinon, on reprend ce que GPT a retourné, ou on fait un fallback LIKE
            $questions    = $iaData['questions']    ?? [];
            $alternatives = $iaData['alternatives'] ?? [];

            if (empty($alternatives)) {
                $kw = substr(preg_replace('/\W+/', ' ', $message), 0, 20);
                $qb = $this->em->createQueryBuilder();
                $qb->select('o')
                    ->from(Operations::class, 'o')
                    ->where($qb->expr()->like('o.name', ':kw'))
                    ->setParameter('kw', "%$kw%")
                    ->setMaxResults(5);
                $found = $qb->getQuery()->getResult();
                $alternatives = array_map(fn(Operations $o) => $o->getName(), $found);
            }

            $responseData = [
                'operation'          => null,
                'price'              => null,
                'time_unit'          => null,
                'additional_help'    => null,
                'additional_comment' => null,
                'questions'          => $questions,
                'alternatives'       => $alternatives,
            ];
        }

        return $this->json($responseData);
    }
}
