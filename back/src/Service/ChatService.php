<?php

namespace App\Service;

use OpenAI\Client;

class ChatService
{
    public function __construct(private Client $openAi)
    {
    }

    /**
     * @param array<array{role:string,content:string}> $messages
     */

    public function ask(array $messages): string
    {
        $response = $this->openAi->chat()->create([
            'model' => 'gpt-4o',
            'temperature' => 0.8,
            'messages' => $messages,
        ]);

        return $response->choices[0]->message->content;
    }
}
