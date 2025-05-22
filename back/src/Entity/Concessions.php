<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ConcessionsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ConcessionsRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['concession:read']],
    denormalizationContext: ['groups' => ['concession:write']]
)]
class Concessions
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?string $city = null;

    #[ORM\Column(length: 255)]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?string $address = null;

    #[ORM\Column(length: 255)]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?string $zipcode = null;

    #[ORM\Column]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?float $latitude = null;

    #[ORM\Column]
    #[Groups(['concession:read', 'appointment:read'])]
    private ?float $longitude = null;

    #[ORM\OneToMany(mappedBy: 'garage', targetEntity: Appointment::class)]
    private Collection $appointments;

    public function __construct()
    {
        $this->appointments = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getZipcode(): ?string
    {
        return $this->zipcode;
    }

    public function setZipcode(string $zipcode): static
    {
        $this->zipcode = $zipcode;
        return $this;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function setLatitude(float $latitude): static
    {
        $this->latitude = $latitude;
        return $this;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function setLongitude(float $longitude): static
    {
        $this->longitude = $longitude;
        return $this;
    }

    /**
     * @return Collection<int, Appointment>
     */
    public function getAppointments(): Collection
    {
        return $this->appointments;
    }

    public function addAppointment(Appointment $appointment): static
    {
        if (!$this->appointments->contains($appointment)) {
            $this->appointments[] = $appointment;
            $appointment->setGarage($this);
        }

        return $this;
    }

    public function removeAppointment(Appointment $appointment): static
    {
        if ($this->appointments->removeElement($appointment)) {
            if ($appointment->getGarage() === $this) {
                $appointment->setGarage(null);
            }
        }

        return $this;
    }
}
