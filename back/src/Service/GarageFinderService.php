<?php

namespace App\Service;

use App\Repository\ConcessionRepository;
use App\Repository\UserRepository;
use App\Service\GeocodingService;
use App\Service\OpenAiService;

class GarageFinderService
{
    public function __construct(
        private readonly OpenAiService $openAi,
        private readonly GeocodingService $geo,
        private readonly ConcessionRepository $concessionRepo,
        private readonly UserRepository $userRepo
    ) {}

    public function findNearestGarages(string $message, int $userId): array
    {
        $user = $this->userRepo->find($userId);
        $address = null;

        // Vérifie si on parle du domicile
        if ($this->openAi->refersToHome($message)) {
            if (
                $user && method_exists($user, 'getStreet') && $user->getStreet() &&
                $user->getPostalCode() && $user->getCity()
            ) {
                $address = implode(', ', array_filter([
                    $user->getStreet(),
                    trim($user->getPostalCode() . ' ' . $user->getCity()),
                    $user->getCountry() ?? 'France'
                ]));
            } else {
                return [
                    'error' => true,
                    'reply' => "Je n'ai pas votre adresse. Vous pouvez l’ajouter dans votre profil ou me l’indiquer directement.",
                    'status' => 400
                ];
            }
        } else {
            // Sinon, extrait une adresse depuis le message
            $address = $this->openAi->extractAddress($message);

            if (!$address) {
                return [
                    'error' => true,
                    'reply' => "Je n’ai pas compris où vous vous trouvez. Pouvez-vous me donner une adresse précise ?",
                    'status' => 400
                ];
            }
        }

        // Convertit en coordonnées GPS
        $coords = $this->geo->getCoordinates($address);
        if (!$coords) {
            return [
                'error' => true,
                'reply' => "Impossible de localiser cette adresse.",
                'status' => 404
            ];
        }

        // Recherche les garages
        $garages = $this->concessionRepo->findClosest($coords['lat'], $coords['lon']);
        if (empty($garages)) {
            return [
                'error' => true,
                'reply' => "Aucun garage trouvé à proximité.",
                'status' => 404
            ];
        }

        return [
            'error' => false,
            'reply' => "Voici les 5 garages les plus proches dans votre département :",
            'garages' => array_map(fn($g) => [
                'name' => $g['name'],
                'address' => $g['address'],
                'city' => $g['city'],
                'zipcode' => $g['zipcode'],
                'latitude' => (float) $g['latitude'],
                'longitude' => (float) $g['longitude'],
                'distance' => round($g['distance'], 2),
            ], $garages)
        ];
    }
}
