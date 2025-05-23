<?php

// src/Controller/ChatBot/SuggestOperationController.php

namespace App\Controller\ChatBot;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SuggestOperationController extends AbstractController
{
    #[Route('/api/chatbot/suggest-operation', name: 'chatbot_suggest_operation', methods: ['POST'])]
    public function suggest(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $problem = $data['message'] ?? '';

        if (!$problem) {
            return $this->json(['error' => 'Message vide.'], 400);
        }

        // Appel à OpenAI ou autre NLU ici
        $prompt = <<<TXT
Tu es GaryBot, assistant automobile expert. L'utilisateur décrit un problème mécanique.

Réponds avec deux champs JSON :
{
  "message": "Phrase concise expliquant ce que tu recommandes",
  "keywords": ["mots-clés de prestations parmi : batterie, huile moteur, freins, filtre à air, pneus, essuie-glaces, refroidissement, habitacle, lave-glace"]
}

Problème : "$problem"
TXT;


        // Appel API OpenAI
        $apiKey = $_ENV['OPENAI_API_KEY'];
        $client = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt_array($client, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $apiKey",
                "Content-Type: application/json"
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'Tu es un assistant automobile qui aide à choisir une prestation.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => 100,
                'temperature' => 0.7
            ])
        ]);

        $response = curl_exec($client);
        curl_close($client);

        $json = json_decode($response, true);
        $reply = json_decode($json['choices'][0]['message']['content'] ?? '{}', true);

if (!isset($reply['message'], $reply['keywords'])) {
    return $this->json(['error' => 'Réponse GPT invalide.'], 500);
}

return $this->json([
    'suggestion' => $reply['message'],
    'keywords' => $reply['keywords'] // ← tableau comme ["batterie", "freins"]
]);

    }
}

