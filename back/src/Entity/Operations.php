<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OperationsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OperationsRepository::class)]
#[ApiResource]
class Operations
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $category = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $additionnal_help = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $additionnal_comment = null;

    #[ORM\Column]
    private ?int $time_unit = null;

    #[ORM\Column]
    private ?int $price = null;

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

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getAdditionnalHelp(): ?string
    {
        return $this->additionnal_help;
    }

    public function setAdditionnalHelp(string $additionnal_help): static
    {
        $this->additionnal_help = $additionnal_help;

        return $this;
    }

    public function getAdditionnalComment(): ?string
    {
        return $this->additionnal_comment;
    }

    public function setAdditionnalComment(string $additionnal_comment): static
    {
        $this->additionnal_comment = $additionnal_comment;

        return $this;
    }

    public function getTimeUnit(): ?int
    {
        return $this->time_unit;
    }

    public function setTimeUnit(int $time_unit): static
    {
        $this->time_unit = $time_unit;

        return $this;
    }

    public function getPrice(): ?int
    {
        return $this->price;
    }

    public function setPrice(int $price): static
    {
        $this->price = $price;

        return $this;
    }
}
