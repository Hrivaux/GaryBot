<?php

namespace App\Entity;

use App\Controller\Appointment\AvailableSlotsController;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Filter\BooleanFilter;
use ApiPlatform\Filter\DateFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['appointment:read']],
    denormalizationContext: ['groups' => ['appointment:write']],
    operations: [
        // liste tous les créneaux
        new GetCollection(),

        // endpoint dédié aux dispo
        new GetCollection(
            name: 'available',
            uriTemplate: '/appointments/available',
            controller: AvailableSlotsController::class,
            read: false,
            paginationEnabled: false
        ),

        new Post(),
        new Get(),
        new Put()
    ]
)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: 'appointment')]
#[ApiFilter(BooleanFilter::class, properties: ['isBooked'])]
#[ApiFilter(DateFilter::class, properties: ['startTime', 'endTime'])]
class Appointment
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['appointment:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['appointment:read', 'appointment:write'])]
    private \DateTimeImmutable $startTime;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['appointment:read', 'appointment:write'])]
    private \DateTimeImmutable $endTime;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['appointment:read', 'appointment:write'])]
    private bool $isBooked = false;

    // --- getters & setters ---
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getStartTime(): \DateTimeImmutable
    {
        return $this->startTime;
    }
    public function setStartTime(\DateTimeImmutable $dt): self
    {
        $this->startTime = $dt;
        return $this;
    }
    public function getEndTime(): \DateTimeImmutable
    {
        return $this->endTime;
    }
    public function setEndTime(\DateTimeImmutable $dt): self
    {
        $this->endTime = $dt;
        return $this;
    }
    public function getIsBooked(): bool
    {
        return $this->isBooked;
    }
    public function setIsBooked(bool $b): self
    {
        $this->isBooked = $b;
        return $this;
    }

    // --- Lifecycle pour garantir start < end et isBooked false par défaut ---
    #[ORM\PrePersist]
    public function prePersist(): void
    {
        if ($this->endTime <= $this->startTime) {
            throw new \InvalidArgumentException('Le créneau doit avoir une fin après le début.');
        }
        // isBooked vaut déjà false
    }
}
