<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class OpenAiService
{
    public function __construct(
        private HttpClientInterface $client,
        private string $openAiApiKey
    ) {
    }

    public function extractAddress(string $message): ?string
    {
        $response = $this->client->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->openAiApiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => "Tu es un assistant. Si le message contient une adresse ou une ville, renvoie-la seule, sans aucun mot autour. Si ce n'est pas le cas, renvoie une chaîne vide."
                    ],
                    ['role' => 'user', 'content' => $message],
                ],
                'temperature' => 0.2,
            ],
        ]);

        $data = $response->toArray(false);
        $address = trim($data['choices'][0]['message']['content'] ?? '');

        // Si le modèle répond par erreur avec "aucune", on neutralise
        if (empty($address) || str_contains(strtolower($address), 'aucune')) {
            return null;
        }

        return $address;
    }

    public function refersToHome(string $message): bool
    {
        $keywords = ['chez moi', 'à la maison', 'mon domicile', 'à mon adresse'];

        foreach ($keywords as $keyword) {
            if (str_contains(strtolower($message), $keyword)) {
                return true;
            }
        }

        return false;
    }
    public function generateMaintenanceForecast(array $context): array
    {
        $today = (new \DateTimeImmutable())->format('Y-m-d');

        $today = new \DateTimeImmutable();
        $dateMEC = isset($context['date']) ? new \DateTimeImmutable($context['date']) : null;
        $km = $context['km'] ?? 0;

        $nextCT = $dateMEC ? clone $dateMEC->modify('+4 years') : null;
        while ($nextCT && $nextCT < $today) {
            $nextCT = $nextCT->modify('+2 years');
        }

        $vehicleAgeInMonths = $dateMEC ? $dateMEC->diff($today)->y * 12 + $dateMEC->diff($today)->m : 24;
        $avgKmPerMonth = $vehicleAgeInMonths > 0 ? round($km / $vehicleAgeInMonths) : 1000;
        $nextRevisionKm = ceil($km / 15000) * 15000;
        $monthsToNextRevision = ceil(($nextRevisionKm - $km) / $avgKmPerMonth);
        $nextRevisionDate = $today->modify("+$monthsToNextRevision months");

        $prompt = sprintf(
            "Tu es un expert automobile.\n" .
            "Voici les informations du véhicule :\n" .
            "Marque : %s\nModèle : %s\nKilométrage actuel : %s km\nDate de mise en circulation : %s\nÉnergie : %s\n" .
            "Nous sommes le %s.\n" .
            "Ajoute OBLIGATOIREMENT en premier dans ta réponse :\n" .
            "- Une tâche \"Contrôle technique à prévoir\" avec une date estimée : %s\n" .
            "- Une tâche \"Révision constructeur à prévoir\" avec une date estimée : %s et un kilométrage : %s km\n" .
            "Ensuite, génère d'autres tâches d’entretien prévisionnel pour les 12 prochains mois à partir d’aujourd’hui.\n" .
            "Pour chaque tâche, donne : task, estimated_date (YYYY-MM-DD), estimated_km.\n" .
            "Retourne uniquement un tableau JSON valide avec les clés : task, estimated_date (YYYY-MM-DD), estimated_km.\n" .
            'Ajoute aucun commentaire, aucun texte, aucune introduction, aucune balise ```json ni """, aucun symbole, commence directement par le début du tableau JSON.',
            $context['marque'] ?? 'inconnue',
            $context['modele'] ?? 'inconnu',
            $context['km'] ?? 'N/A',
            $context['date'] ?? 'inconnue',
            $context['energie'] ?? 'inconnue',
            $today->format('Y-m-d'),
            $nextCT ? $nextCT->format('Y-m-d') : 'inconnue',
            $nextRevisionDate->format('Y-m-d'),
            $nextRevisionKm
        );

        $response = $this->client->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->openAiApiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'Tu es un assistant spécialisé dans l’entretien automobile.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.3
            ],
        ]);

        $data = $response->toArray(false);
        $content = trim($data['choices'][0]['message']['content'] ?? '');
        dump($content);
        $decoded = json_decode($content, true);

        if (!is_array($decoded)) {
            return [['task' => 'Erreur : réponse OpenAI non valide', 'estimated_date' => null, 'estimated_km' => null]];
        }

        return $decoded;
    }
}
