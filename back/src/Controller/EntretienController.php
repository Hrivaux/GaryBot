<?php

namespace App\Controller;

use App\Repository\EntretienRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class EntretienController extends AbstractController
{
    #[Route('/api/entretiens', name: 'api_entretiens', methods: ['GET'])]
    public function index(EntretienRepository $entretienRepository): JsonResponse
    {
        $entretiens = $entretienRepository->findAll();

        $data = array_map(function ($e) {
            return [
                'piece' => $e->getPiece(),
                'description' => $e->getDescription(),
                'frequence_km' => $e->getFrequenceKm(),
                'frequence_annees' => $e->getFrequenceAnnees(),
            ];
        }, $entretiens);

        return $this->json($data);
    }
}
