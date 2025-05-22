<?php

namespace App\Controller;

use App\Service\ChatService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ChatController extends AbstractController
{
    public function __construct(private ChatService $chatService)
    {
    }

    #[Route('/api/chat', name: 'api_chat', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $messages = $data['messages'] ?? [];

        $reply = $this->chatService->ask($messages);

        return $this->json(['reply' => $reply]);
    }
}
