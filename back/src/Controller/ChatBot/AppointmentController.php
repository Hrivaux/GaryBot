<?php

namespace App\Controller\ChatBot;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Operation;
use App\Entity\Vehicle;
use App\Repository\ConcessionRepository;
use App\Repository\GarageRepository;
use App\Repository\OperationsRepository;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

class AppointmentController extends AbstractController
{
    #[Route('/api/appointment', name: 'api_appointment_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ConcessionRepository $garageRepo,
        OperationsRepository $operationRepo,
        VehicleRepository $vehicleRepo,
        Security $security
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $garageId = $data['garage_id'] ?? null;
        $operationId = $data['operation_id'] ?? null;
        $dateStr = $data['date'] ?? null;
        $vehicleId = $data['vehicle_id'] ?? null;

        if (!$garageId || !$operationId || !$dateStr) {
            return $this->json(['error' => 'garage_id, operation_id et date sont requis.'], 400);
        }

        $garage = $garageRepo->find($garageId);
        $operation = $operationRepo->find($operationId);

        if (!$garage || !$operation) {
            return $this->json(['error' => 'Garage ou opération invalide.'], 404);
        }

        $vehicle = null;
        if ($vehicleId) {
            $vehicle = $vehicleRepo->find($vehicleId);
            if (!$vehicle || $vehicle->getUser() !== $security->getUser()) {
                return $this->json(['error' => 'Véhicule non trouvé ou non autorisé.'], 403);
            }
        }

        try {
            $appointment = new Appointment();
            $appointment->setGarage($garage);
            $appointment->setOperation($operation);
            $start = new \DateTimeImmutable($dateStr);
            $end = $start->modify('+1 hour');

            $appointment->setStartTime($start);
            $appointment->setEndTime($end);
            $appointment->setUser($security->getUser());

            if ($vehicle) {
                $appointment->setVehicle($vehicle);
            }

            $em->persist($appointment);
            $em->flush();

            return $this->json([
                'success' => true,
                'message' => 'Rendez-vous enregistré.',
                'id' => $appointment->getId(),
                'garage' => $garage->getName(),
                'operation' => $operation->getName(),
                'date' => $appointment->getStartTime()->format('Y-m-d'),
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Erreur serveur : ' . $e->getMessage()], 500);
        }
    }
}
