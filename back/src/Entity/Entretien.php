<?php

namespace App\Entity;

use App\Repository\EntretienRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EntretienRepository::class)]
class Entretien
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $piece = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    private ?int $frequenceKm = null;

    #[ORM\Column(nullable: true)]
    private ?int $frequenceAnnees = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPiece(): ?string
    {
        return $this->piece;
    }

    public function setPiece(string $piece): static
    {
        $this->piece = $piece;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getFrequenceKm(): ?int
    {
        return $this->frequenceKm;
    }

    public function setFrequenceKm(?int $frequenceKm): static
    {
        $this->frequenceKm = $frequenceKm;
        return $this;
    }

    public function getFrequenceAnnees(): ?int
    {
        return $this->frequenceAnnees;
    }

    public function setFrequenceAnnees(?int $frequenceAnnees): static
    {
        $this->frequenceAnnees = $frequenceAnnees;
        return $this;
    }
}
