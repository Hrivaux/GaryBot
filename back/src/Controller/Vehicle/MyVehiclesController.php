<?php

namespace App\Controller\Vehicle;

use App\Entity\User;
use App\Repository\VehicleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MyVehiclesController extends AbstractController
{
    #[Route('/api/me/vehicles', name: 'api_me_vehicles_get', methods: ['GET'])]
    public function getUserVehicles(VehicleRepository $vehicleRepository): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $vehicles = $vehicleRepository->findBy(['user' => $user]);

        $vehicleData = array_map(function ($v) {
            return [
                'id' => $v->getId(),
                'immat' => $v->getImmat(),
                'marque' => $v->getMarque(),
                'modele' => $v->getModele(),
                'dateMiseCirculation' => $v->getDateMiseCirculation()?->format('Y-m-d'),
                'energie' => $v->getEnergie(),
                'co2' => $v->getCo2(),
                'puissanceFiscale' => $v->getPuissanceFiscale(),
                'puissanceReelle' => $v->getPuissanceReelle(),
                'carrosserie' => $v->getCarrosserie(),
                'boiteVitesse' => $v->getBoiteVitesse(),
                'nbPassagers' => $v->getNbPassagers(),
                'nbPortes' => $v->getNbPortes(),
                'nomCommercial' => $v->getNomCommercial(),
                'vin' => $v->getVin(),
                'couleur' => $v->getCouleur(),
                'logoMarque' => $v->getLogoMarque(),
                'km' => $v->getKm(),
            ];
        }, $vehicles);

        return $this->json($vehicleData);
    }
}
