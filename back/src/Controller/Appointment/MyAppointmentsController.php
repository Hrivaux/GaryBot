<?php

namespace App\Controller\Appointment;

use App\Entity\User;
use App\Repository\AppointmentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MyAppointmentsController extends AbstractController
{
    #[Route('/api/me/appointments', name: 'api_me_appointments_get', methods: ['GET'])]
    public function getUserAppointments(AppointmentRepository $appointmentRepository): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $appointments = $appointmentRepository->createQueryBuilder('a')
            ->leftJoin('a.vehicle', 'v')
            ->addSelect('v')
            ->leftJoin('a.operation', 'o')
            ->addSelect('o')
            ->where('a.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();

        $appointmentData = array_map(function ($a) {
            return [
                'id' => $a->getId(),
                'startTime' => $a->getStartTime()->format('Y-m-d H:i:s'),
                'endTime' => $a->getEndTime()->format('Y-m-d H:i:s'),
                'status' => $a->getIsBooked(),
                'vehicle' => $a->getVehicle() ? [
                    'id' => $a->getVehicle()->getId(),
                    'immat' => $a->getVehicle()->getImmat(),
                    'marque' => $a->getVehicle()->getMarque(),
                    'modele' => $a->getVehicle()->getModele(),
                ] : null,
                'operation' => $a->getOperation() ? [
                    'id' => $a->getOperation()->getId(),
                    'name' => $a->getOperation()->getName(),
                    'category' => $a->getOperation()->getCategory(),
                    'time_unit' => $a->getOperation()->getTimeUnit(),
                    'price' => $a->getOperation()->getPrice(),
                ] : null,
                'garage' => $a->getGarage() ? [
                    'name' => $a->getGarage()->getName(),
                    'address' => $a->getGarage()->getAddress(),
                    'city' => $a->getGarage()->getCity(),
                    'zipcode' => $a->getGarage()->getZipcode(),
                ] : null,
            ];
        }, $appointments);


        return $this->json($appointmentData);
    }
}

