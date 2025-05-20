<?php

namespace App\Controller\Appointment;

use App\Repository\AppointmentRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class AvailableSlotsController
{
    public function __construct(private AppointmentRepository $repo)
    {
    }

    public function __invoke(Request $req): JsonResponse
    {
        $start = new \DateTimeImmutable($req->query->get('startDate'));
        $end = new \DateTimeImmutable($req->query->get('endDate'));

        $slots = $this->repo->createQueryBuilder('a')
            ->where('a.isBooked = :free')
            ->andWhere('a.startTime >= :start')
            ->andWhere('a.endTime   <= :end')
            ->setParameter('free', false)
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('a.startTime', 'ASC')
            ->getQuery()
            ->getResult();

        return new JsonResponse($slots, 200, [], true);
    }
}
