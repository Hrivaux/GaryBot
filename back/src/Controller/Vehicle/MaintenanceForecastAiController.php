<?php

namespace App\Controller\Vehicle;

use App\Repository\VehicleRepository;
use App\Service\OpenAiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MaintenanceForecastAiController extends AbstractController
{
    #[Route('/api/vehicles/{id}/maintenance-ai', name: 'vehicle_maintenance_ai', methods: ['GET'])]
    public function __invoke(int $id, VehicleRepository $repo, OpenAiService $openAi): JsonResponse
    {
        $vehicle = $repo->find($id);
        if (!$vehicle) {
            return $this->json(['error' => 'Véhicule non trouvé'], 404);
        }

        $context = [
            'marque' => $vehicle->getMarque(),
            'modele' => $vehicle->getModele(),
            'km' => $vehicle->getKm(),
            'date' => $vehicle->getDateMiseCirculation()?->format('Y-m-d'),
            'energie' => $vehicle->getEnergie(),
        ];

        $forecast = $openAi->generateMaintenanceForecast($context);

        return $this->json([
            'vehicle_id' => $id,
            'forecast' => $forecast
        ]);
    }
}
