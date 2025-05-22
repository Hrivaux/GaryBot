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
use App\Controller\Appointment\MyAppointmentsController;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Entity\Operations;
use App\Entity\Concessions;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['appointment:read']],
    denormalizationContext: ['groups' => ['appointment:write']],
    operations: [
        new GetCollection(),
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

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['appointment:read', 'appointment:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Vehicle::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['appointment:read', 'appointment:write'])]
    private ?Vehicle $vehicle = null;

    #[ORM\ManyToOne(targetEntity: Operations::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['appointment:read', 'appointment:write'])]
    private ?Operations $operation = null;

    #[ORM\ManyToOne(targetEntity: Concessions::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['appointment:read', 'appointment:write'])]
    private ?Concessions $garage = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartTime(): \DateTimeImmutable
    {
        return $this->startTime;
    }

    public function setStartTime(\DateTimeImmutable $startTime): self
    {
        $this->startTime = $startTime;
        return $this;
    }

    public function getEndTime(): \DateTimeImmutable
    {
        return $this->endTime;
    }

    public function setEndTime(\DateTimeImmutable $endTime): self
    {
        $this->endTime = $endTime;
        return $this;
    }

    public function getIsBooked(): bool
    {
        return $this->isBooked;
    }

    public function setIsBooked(bool $isBooked): self
    {
        $this->isBooked = $isBooked;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getVehicle(): ?Vehicle
    {
        return $this->vehicle;
    }

    public function setVehicle(Vehicle $vehicle): self
    {
        $this->vehicle = $vehicle;
        return $this;
    }

    public function getOperation(): ?Operations
    {
        return $this->operation;
    }

    public function setOperation(Operations $operation): self
    {
        $this->operation = $operation;
        return $this;
    }

    public function getGarage(): ?Concessions
    {
        return $this->garage;
    }

    public function setGarage(?Concessions $garage): self
    {
        $this->garage = $garage;
        return $this;
    }

    #[ORM\PrePersist]
    public function prePersist(): void
    {
        if ($this->endTime <= $this->startTime) {
            throw new \InvalidArgumentException('Le créneau doit avoir une fin après le début.');
        }

        $this->isBooked = false;
    }
}
