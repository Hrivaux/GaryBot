<?php

namespace App\Controller\ChatBot;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ChatbotController extends AbstractController
{
    public function __construct(
        private RequestStack $requestStack,
        private JWTTokenManagerInterface $jwtManager
    ) {
    }

    #[Route('/api/chatbot/start', name: 'chatbot_start', methods: ['GET'])]
    public function start(): JsonResponse
    {
        $request = $this->requestStack->getCurrentRequest();
        $authHeader = $request?->headers->get('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->json(['error' => 'Token manquant ou invalide.'], 401);
        }

        $token = str_replace('Bearer ', '', $authHeader);
        $payload = $this->jwtManager->parse($token);

        $firstName = $payload['firstName'] ?? 'Utilisateur';

        return $this->json([
            'message' => "Bonjour $firstName 👋 ! En quoi puis-je vous aider concernant votre véhicule aujourd’hui ?",
            'user' => [
                'firstName' => $firstName,
                'email' => $payload['email'] ?? null,
            ],
            'next' => [
                'type' => 'question',
                'text' => 'Vous pouvez m’écrire un message libre ou cliquer sur un bouton pour démarrer.',
                'suggestions' => [
                    'Prendre rendez-vous',
                    'J’ai une panne',
                    'Faire un devis',
                ]
            ]
        ]);
    }
}
