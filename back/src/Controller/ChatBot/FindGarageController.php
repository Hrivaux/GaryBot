<?php

namespace App\Controller\ChatBot;

use App\Repository\ConcessionRepository;
use App\Service\OpenAiService;
use App\Service\GeocodingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;

class FindGarageController extends AbstractController
{
    #[Route('/api/chatbot/find-garage', name: 'chatbot_find_garage', methods: ['POST'])]
    public function __invoke(
        Request $request,
        OpenAiService $openAi,
        GeocodingService $geo,
        ConcessionRepository $concessionRepo,
        UserRepository $userRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $message = $data['message'] ?? '';

        $token = $this->container->get('security.token_storage')->getToken();
        $userId = $token?->getUser()?->getId();

        $user = $userRepo->find($userId);
        $address = null;

        // Est-ce que le message parle du domicile ?
        if ($openAi->refersToHome($message)) {
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
                return $this->json(['reply' => "Je n'ai pas votre adresse. Vous pouvez l’ajouter dans votre profil ou me l’indiquer directement."], 400);
            }
        } else {
            // Sinon on extrait une adresse à partir du message
            $address = $openAi->extractAddress($message);

            if (!$address) {
                return $this->json([
                    'reply' => "Je n’ai pas compris où vous vous trouvez. Pouvez-vous me donner une adresse précise ?"
                ], 400);
            }
        }

        // Conversion en coordonnées
        $coords = $geo->getCoordinates($address);
        if (!$coords) {
            return $this->json(['reply' => 'Impossible de localiser cette adresse.'], 404);
        }

        // Récupération des 5 garages les plus proches dans le même département
        $garages = $concessionRepo->findClosest($coords['lat'], $coords['lon']);

        if (!$garages) {
            return $this->json(['reply' => 'Aucun garage trouvé à proximité.'], 404);
        }

        return $this->json([
            'reply' => "Voici les 5 garages les plus proches dans votre département :",
            'garages' => array_map(fn($g) => [
                'name' => $g['name'],
                'address' => $g['address'],
                'city' => $g['city'],
                'zipcode' => $g['zipcode'],
                'latitude' => (float) $g['latitude'],
                'longitude' => (float) $g['longitude'],
                'distance' => round($g['distance'], 2)
            ], $garages)
        ]);
    }
}
