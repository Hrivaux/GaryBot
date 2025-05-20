<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\VehicleRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VehicleRepository::class)]
#[ApiResource]
class Vehicle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $user_id = null;

    #[ORM\Column(length: 255)]
    private ?string $immat = null;

    #[ORM\Column(length: 255)]
    private ?string $marque = null;

    #[ORM\Column(length: 255)]
    private ?string $modele = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $date_mise_circulation = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $energie = null;

    #[ORM\Column(nullable: true)]
    private ?int $co2 = null;

    #[ORM\Column(nullable: true)]
    private ?int $puissance_fiscale = null;

    #[ORM\Column(nullable: true)]
    private ?int $puissance_reelle = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $carrosserie = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $boite_vitesse = null;

    #[ORM\Column(nullable: true)]
    private ?int $nb_passagers = null;

    #[ORM\Column(nullable: true)]
    private ?int $nb_portes = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $nom_commercial = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $vin = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $couleur = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $logo_marque = null;

    #[ORM\Column(nullable: true)]
    private ?int $km = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?int
    {
        return $this->user_id;
    }

    public function setUserId(int $user_id): static
    {
        $this->user_id = $user_id;

        return $this;
    }

    public function getImmat(): ?string
    {
        return $this->immat;
    }

    public function setImmat(string $immat): static
    {
        $this->immat = $immat;

        return $this;
    }

    public function getMarque(): ?string
    {
        return $this->marque;
    }

    public function setMarque(string $marque): static
    {
        $this->marque = $marque;

        return $this;
    }

    public function getModele(): ?string
    {
        return $this->modele;
    }

    public function setModele(string $modele): static
    {
        $this->modele = $modele;

        return $this;
    }

    public function getDateMiseCirculation(): ?\DateTimeImmutable
    {
        return $this->date_mise_circulation;
    }

    public function setDateMiseCirculation(?\DateTimeImmutable $date_mise_circulation): static
    {
        $this->date_mise_circulation = $date_mise_circulation;

        return $this;
    }

    public function getEnergie(): ?string
    {
        return $this->energie;
    }

    public function setEnergie(?string $energie): static
    {
        $this->energie = $energie;

        return $this;
    }

    public function getCo2(): ?int
    {
        return $this->co2;
    }

    public function setCo2(?int $co2): static
    {
        $this->co2 = $co2;

        return $this;
    }

    public function getPuissanceFiscale(): ?int
    {
        return $this->puissance_fiscale;
    }

    public function setPuissanceFiscale(?int $puissance_fiscale): static
    {
        $this->puissance_fiscale = $puissance_fiscale;

        return $this;
    }

    public function getPuissanceReelle(): ?int
    {
        return $this->puissance_reelle;
    }

    public function setPuissanceReelle(?int $puissance_reelle): static
    {
        $this->puissance_reelle = $puissance_reelle;

        return $this;
    }

    public function getCarrosserie(): ?string
    {
        return $this->carrosserie;
    }

    public function setCarrosserie(?string $carrosserie): static
    {
        $this->carrosserie = $carrosserie;

        return $this;
    }

    public function getBoiteVitesse(): ?string
    {
        return $this->boite_vitesse;
    }

    public function setBoiteVitesse(?string $boite_vitesse): static
    {
        $this->boite_vitesse = $boite_vitesse;

        return $this;
    }

    public function getNbPassagers(): ?int
    {
        return $this->nb_passagers;
    }

    public function setNbPassagers(?int $nb_passagers): static
    {
        $this->nb_passagers = $nb_passagers;

        return $this;
    }

    public function getNbPortes(): ?int
    {
        return $this->nb_portes;
    }

    public function setNbPortes(?int $nb_portes): static
    {
        $this->nb_portes = $nb_portes;

        return $this;
    }

    public function getNomCommercial(): ?string
    {
        return $this->nom_commercial;
    }

    public function setNomCommercial(?string $nom_commercial): static
    {
        $this->nom_commercial = $nom_commercial;

        return $this;
    }

    public function getVin(): ?string
    {
        return $this->vin;
    }

    public function setVin(?string $vin): static
    {
        $this->vin = $vin;

        return $this;
    }

    public function getCouleur(): ?string
    {
        return $this->couleur;
    }

    public function setCouleur(?string $couleur): static
    {
        $this->couleur = $couleur;

        return $this;
    }

    public function getLogoMarque(): ?string
    {
        return $this->logo_marque;
    }

    public function setLogoMarque(?string $logo_marque): static
    {
        $this->logo_marque = $logo_marque;

        return $this;
    }

    public function getKm(): ?int
    {
        return $this->km;
    }

    public function setKm(?int $km): static
    {
        $this->km = $km;

        return $this;
    }
}
