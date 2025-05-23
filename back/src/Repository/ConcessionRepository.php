<?php

namespace App\Repository;

use App\Entity\Concessions;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ConcessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Concessions::class);
    }

    public function findClosest(float $lat, float $lon): array
    {
        $conn = $this->getEntityManager()->getConnection();

        // 1. Déterminer le département du point de départ (2 premiers chiffres du plus proche CP)
        $sqlDept = <<<SQL
        SELECT zipcode FROM concessions
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY (
            6371 * acos(
                cos(radians(:lat)) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(:lon)) +
                sin(radians(:lat)) *
                sin(radians(latitude))
            )
        ) ASC
        LIMIT 1
    SQL;

        $stmtDept = $conn->prepare($sqlDept);
        $resultDept = $stmtDept->executeQuery([
            'lat' => $lat,
            'lon' => $lon
        ]);

        $closest = $resultDept->fetchAssociative();

        if (!$closest || !isset($closest['zipcode'])) {
            return [];
        }

        $deptCode = substr($closest['zipcode'], 0, 2);

        // 2. Trouver les 5 garages les plus proches dans ce département uniquement
        $sql = <<<SQL
    SELECT id, name, address, city, zipcode, latitude, longitude, (
        6371 * acos(
            cos(radians(:lat)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians(:lon)) +
            sin(radians(:lat)) *
            sin(radians(latitude))
        )
    ) AS distance
    FROM concessions
    WHERE zipcode LIKE :dept
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    ORDER BY distance ASC
    LIMIT 5
SQL;


        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'lat' => $lat,
            'lon' => $lon,
            'dept' => $deptCode . '%'
        ]);

        return $result->fetchAllAssociative();
    }
}
