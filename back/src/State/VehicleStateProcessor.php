<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Vehicle;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class VehicleStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private TokenStorageInterface $tokenStorage,
        private HttpClientInterface $httpClient,
        private UserRepository $userRepo,
        private string $plaqueApiToken
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Vehicle) {
            return $data;
        }

        $immat = strtoupper(trim($data->getImmat()));
        $km = $data->getKm();

        if (!$immat || !$km) {
            throw new \InvalidArgumentException('Champs immat et km obligatoires.');
        }

        $user = $this->tokenStorage->getToken()?->getUser();
        $user = is_object($user) ? $this->userRepo->find($user->getId()) : null;

        if (!$user) {
            throw new \RuntimeException('Utilisateur non connecté.');
        }

        $data->setUser($user);

        $response = $this->httpClient->request('GET', 'https://api.apiplaqueimmatriculation.com/plaque', [
            'query' => [
                'immatriculation' => $immat,
                'token' => $this->plaqueApiToken,
                'pays' => 'FR'
            ]
        ]);

        $info = $response->toArray()['data'] ?? null;

        if (isset($info['error'])) {
            throw new \RuntimeException('Véhicule introuvable pour cette immatriculation.');
        }

        $data->setMarque($info['marque'] ?? null);
        $data->setModele($info['modele'] ?? null);
        $data->setDateMiseCirculation(new \DateTimeImmutable($info['date1erCir_fr'] ?? 'now'));
        $data->setEnergie($info['energie'] ?? null);
        $data->setCo2($info['co2'] ?? null);
        $data->setPuissanceFiscale($info['puisFisc'] ?? null);
        $puisFiscReelCH = isset($info['puisFiscReelCH'])
            ? (int) filter_var($info['puisFiscReelCH'], FILTER_SANITIZE_NUMBER_INT)
            : null;
        $data->setPuissanceReelle($puisFiscReelCH);
        $data->setCarrosserie($info['carrosserie'] ?? null);
        $data->setBoiteVitesse($info['boite_vitesse'] ?? null);
        $data->setNbPassagers($info['nr_passagers'] ?? null);
        $data->setNbPortes($info['nb_portes'] ?? null);
        $data->setNomCommercial($info['sra_commercial'] ?? null);
        $data->setVin($info['vin'] ?? null);
        $data->setCouleur($info['couleur'] ?? null);
        $data->setLogoMarque($info['logo_marque'] ?? null);

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
