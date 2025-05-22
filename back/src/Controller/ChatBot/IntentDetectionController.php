<?php

namespace App\Controller\ChatBot;

use App\Service\OpenAiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class IntentDetectionController extends AbstractController
{
    #[Route('/api/chatbot/detect-intent', name: 'chatbot_detect_intent', methods: ['POST'])]
public function __invoke(Request $request, OpenAiService $openAi): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    $message = $data['message'] ?? '';

    if (!$message) {
        return $this->json(['error' => 'Message manquant'], 400);
    }

    $result = $openAi->detectIntent($message);

    if (!$result) {
        return $this->json(['error' => 'Erreur lors de l’analyse du message'], 500);
    }

    return $this->json($result);
}

}
