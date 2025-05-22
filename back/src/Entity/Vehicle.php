<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\VehicleRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\User;

#[ORM\Entity(repositoryClass: VehicleRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['vehicle:read']],
    denormalizationContext: ['groups' => ['vehicle:write']]
)]
#[ORM\Table(name: 'vehicle')]
class Vehicle
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $id = null;

    // Relation ManyToOne vers User
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'vehicles')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private User $user;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $immat = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $marque = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $modele = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?\DateTimeImmutable $dateMiseCirculation = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $energie = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $co2 = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $puissanceFiscale = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $puissanceReelle = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $carrosserie = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $boiteVitesse = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $nbPassagers = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $nbPortes = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $nomCommercial = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $vin = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $couleur = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $logoMarque = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $km = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getImmat(): ?string
    {
        return $this->immat;
    }

    public function setImmat(string $immat): self
    {
        $this->immat = $immat;
        return $this;
    }

    public function getMarque(): ?string
    {
        return $this->marque;
    }

    public function setMarque(string $marque): self
    {
        $this->marque = $marque;
        return $this;
    }

    public function getModele(): ?string
    {
        return $this->modele;
    }

    public function setModele(string $modele): self
    {
        $this->modele = $modele;
        return $this;
    }

    public function getDateMiseCirculation(): ?\DateTimeImmutable
    {
        return $this->dateMiseCirculation;
    }

    public function setDateMiseCirculation(?\DateTimeImmutable $dateMiseCirculation): self
    {
        $this->dateMiseCirculation = $dateMiseCirculation;
        return $this;
    }

    public function getEnergie(): ?string
    {
        return $this->energie;
    }

    public function setEnergie(?string $energie): self
    {
        $this->energie = $energie;
        return $this;
    }

    public function getCo2(): ?int
    {
        return $this->co2;
    }

    public function setCo2(?int $co2): self
    {
        $this->co2 = $co2;
        return $this;
    }

    public function getPuissanceFiscale(): ?int
    {
        return $this->puissanceFiscale;
    }

    public function setPuissanceFiscale(?int $puissanceFiscale): self
    {
        $this->puissanceFiscale = $puissanceFiscale;
        return $this;
    }

    public function getPuissanceReelle(): ?int
    {
        return $this->puissanceReelle;
    }

    public function setPuissanceReelle(?int $puissanceReelle): self
    {
        $this->puissanceReelle = $puissanceReelle;
        return $this;
    }

    public function getCarrosserie(): ?string
    {
        return $this->carrosserie;
    }

    public function setCarrosserie(?string $carrosserie): self
    {
        $this->carrosserie = $carrosserie;
        return $this;
    }

    public function getBoiteVitesse(): ?string
    {
        return $this->boiteVitesse;
    }

    public function setBoiteVitesse(?string $boiteVitesse): self
    {
        $this->boiteVitesse = $boiteVitesse;
        return $this;
    }

    public function getNbPassagers(): ?int
    {
        return $this->nbPassagers;
    }

    public function setNbPassagers(?int $nbPassagers): self
    {
        $this->nbPassagers = $nbPassagers;
        return $this;
    }

    public function getNbPortes(): ?int
    {
        return $this->nbPortes;
    }

    public function setNbPortes(?int $nbPortes): self
    {
        $this->nbPortes = $nbPortes;
        return $this;
    }

    public function getNomCommercial(): ?string
    {
        return $this->nomCommercial;
    }

    public function setNomCommercial(?string $nomCommercial): self
    {
        $this->nomCommercial = $nomCommercial;
        return $this;
    }

    public function getVin(): ?string
    {
        return $this->vin;
    }

    public function setVin(?string $vin): self
    {
        $this->vin = $vin;
        return $this;
    }

    public function getCouleur(): ?string
    {
        return $this->couleur;
    }

    public function setCouleur(?string $couleur): self
    {
        $this->couleur = $couleur;
        return $this;
    }

    public function getLogoMarque(): ?string
    {
        return $this->logoMarque;
    }

    public function setLogoMarque(?string $logoMarque): self
    {
        $this->logoMarque = $logoMarque;
        return $this;
    }

    public function getKm(): ?int
    {
        return $this->km;
    }

    public function setKm(?int $km): self
    {
        $this->km = $km;
        return $this;
    }
}
