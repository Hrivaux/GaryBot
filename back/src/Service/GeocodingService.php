<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class GeocodingService
{
    public function __construct(private HttpClientInterface $client)
    {
    }

    public function getCoordinates(string $address): ?array
    {
        $url = 'https://nominatim.openstreetmap.org/search';

        $address = trim($address);

        $response = $this->client->request('GET', $url, [
            'query' => [
                'q' => $address,
                'format' => 'json',
                'limit' => 1
            ],
            'headers' => [
                'User-Agent' => 'SymfonyGarageBot/1.0'
            ]
        ]);

        $data = $response->toArray(false);

        if (!isset($data[0]['lat']) || !isset($data[0]['lon'])) {
            return null;
        }

        return [
            'lat' => (float) $data[0]['lat'],
            'lon' => (float) $data[0]['lon']
        ];
    }
}
