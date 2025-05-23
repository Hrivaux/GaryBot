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
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté.'], 401);
        }

        $data    = json_decode($request->getContent(), true);
        $message = trim($data['message'] ?? '');

        if ($message === '') {
            return $this->json(['error' => 'Message manquant.'], 400);
        }

        // Charger le catalogue
        $operations = $this->em->getRepository(Operations::class)->findAll();
        $catalogueText = implode("\n", array_map(fn($o) => $o->getName(), $operations));

        // Prompt amélioré
        $systemPrompt = <<<PROMPT
Tu es un assistant automobile intelligent. Tu dois TOUJOURS répondre en JSON strictement valide, avec cette structure :

{
  "operation": "Nom de l'opération choisie ou null",
  "questions": ["question utile 1", "question utile 2"],
  "alternatives": ["option 1", "option 2"]
}

Règles strictes :
1. Commence toujours par : "Bonjour, avez-vous un problème avec votre voiture ?" + alternatives ["Oui","Non"].
2. Si l'utilisateur dit "oui", demande une description courte du problème.
3. Dès qu'un symptôme clair est donné (ex : "bruit au freinage", "la voiture tire à droite"), IDENTIFIE une opération du catalogue ou propose max 3 alternatives concrètes.
4. Tu n'as droit qu'à **2 questions maximum** avant de faire une **suggestion d'opération**.
5. Ne boucle JAMAIS. Ne pose JAMAIS deux fois une question proche (ex : “Pouvez-vous décrire” deux fois).
6. Si l'utilisateur est déjà très clair, propose immédiatement une opération (comme “Service plaquettes de frein”).
7. Tu ne peux proposer une opération que si elle existe EXACTEMENT (ou partiellement) dans ce catalogue :

$catalogueText

PROMPT;

        // Appel GPT
        $prompt = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => $message],
        ];

        $response = $this->client->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $_ENV['OPENAI_API_KEY'],
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'model'       => 'gpt-4-turbo',
                'messages'    => $prompt,
                'temperature' => 0.4,
            ],
        ]);

        $result  = $response->toArray(false);
        $content = $result['choices'][0]['message']['content'] ?? '{}';
        $aiData  = json_decode($content, true);

        $operationName = $aiData['operation'] ?? null;
        $operation = null;

        if ($operationName) {
            $operation = $this->em->createQueryBuilder()
                ->select('o')
                ->from(Operations::class, 'o')
                ->where('LOWER(o.name) LIKE :name')
                ->setParameter('name', '%' . strtolower($operationName) . '%')
                ->setMaxResults(1)
                ->getQuery()
                ->getOneOrNullResult();
        }

        if ($operation) {
            return $this->json([
                'operation'          => $operation->getName(),
                'price'              => $operation->getPrice(),
                'time_unit'          => $operation->getTimeUnit(),
                'additional_help'    => $operation->getAdditionnalHelp(),
                'additional_comment' => $operation->getAdditionnalComment(),
                'questions'          => $aiData['questions']    ?? [],
                'alternatives'       => [],
            ]);
        }

        // Si aucune opération trouvée : fallback
        $questions    = $aiData['questions']    ?? [];
        $alternatives = $aiData['alternatives'] ?? [];

        if (empty($alternatives)) {
            $keywords = substr(preg_replace('/\W+/', ' ', $message), 0, 30);
            $found = $this->em->createQueryBuilder()
                ->select('o')
                ->from(Operations::class, 'o')
                ->where('LOWER(o.name) LIKE :kw')
                ->setParameter('kw', '%' . strtolower($keywords) . '%')
                ->setMaxResults(3)
                ->getQuery()
                ->getResult();

            $alternatives = array_map(fn(Operations $o) => $o->getName(), $found);
        }

        return $this->json([
            'operation'          => null,
            'price'              => null,
            'time_unit'          => null,
            'additional_help'    => null,
            'additional_comment' => null,
            'questions'          => $questions,
            'alternatives'       => $alternatives,
        ]);
    }
}
