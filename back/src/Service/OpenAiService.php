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
}
