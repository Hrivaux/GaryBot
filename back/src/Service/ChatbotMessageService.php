<?php

namespace App\Service;

use App\Entity\Operations;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ChatbotMessageService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly HttpClientInterface $client
    ) {}

    public function resolve(string $message): array
    {
        // 1. Charger le catalogue depuis la BDD
        $ops = $this->em->getRepository(Operations::class)->findAll();
        $catalogue = array_map(fn(Operations $o) => $o->getName(), $ops);
        $catalogueText = implode("\n", $catalogue);

        // 2. Construire le prompt
        $system = <<<TXT
Tu es un assistant automobile. Tu dois toujours répondre en JSON valide, avec les champs :
{
  "operation": "Nom de l'opération choisie ou null",
  "questions": ["liste", "de", "questions", "..."],
  "alternatives": ["op1","op2",...]
}
Règles à suivre :
1) Si l'utilisateur dit "bonjour", tu réponds par une question de type :
   "Bonjour, avez-vous un problème avec votre voiture ?"
   et tu fournis comme alternatives ["Oui","Non"].
2) Si l'utilisateur répond "Oui", tu poses une question pour qu'il décrive son problème.
3) Si l'utilisateur répond "Non", tu termines poliment la conversation sans proposer d'opération.
4) Si l'utilisateur décrit un problème, tu identifies la meilleure opération dans le catalogue ou tu poses des questions complémentaires.
5) Tu peux proposer jusqu'à 10 alternatives si tu n'arrives pas à choisir une seule.
Catalogue disponible :
$catalogueText
TXT;

        $prompt = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user',   'content' => $message],
        ];

        // 3. Appel à l'API OpenAI
        $response = $this->client->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $_ENV['OPENAI_API_KEY'],
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'gpt-4-turbo',
                'messages' => $prompt,
                'temperature' => 0.5,
            ],
        ]);

        $result = $response->toArray(false);
        $content = $result['choices'][0]['message']['content'] ?? '';
        $iaData = json_decode($content, true);

        // 4. Compléter avec infos BDD si opération détectée
        $opName = $iaData['operation'] ?? null;
        if ($opName) {
            $operation = $this->em->getRepository(Operations::class)->findOneBy(['name' => $opName]);
            if ($operation) {
                return [
                    'operation'          => $operation->getName(),
                    'price'              => $operation->getPrice(),
                    'time_unit'          => $operation->getTimeUnit(),
                    'additional_help'    => $operation->getAdditionnalHelp(),
                    'additional_comment' => $operation->getAdditionnalComment(),
                    'questions'          => $iaData['questions'] ?? [],
                    'alternatives'       => [],
                ];
            }
        }

        // 5. Fallback : suggestions d'opérations
        $questions = $iaData['questions'] ?? [];
        $alternatives = $iaData['alternatives'] ?? [];

        if (empty($alternatives)) {
            $kw = substr(preg_replace('/\W+/', ' ', $message), 0, 20);
            $qb = $this->em->createQueryBuilder();
            $qb->select('o')
                ->from(Operations::class, 'o')
                ->where($qb->expr()->like('o.name', ':kw'))
                ->setParameter('kw', "%$kw%")
                ->setMaxResults(5);
            $found = $qb->getQuery()->getResult();
            $alternatives = array_map(fn(Operations $o) => $o->getName(), $found);
        }

        return [
            'operation'          => null,
            'price'              => null,
            'time_unit'          => null,
            'additional_help'    => null,
            'additional_comment' => null,
            'questions'          => $questions,
            'alternatives'       => $alternatives,
        ];
    }
}
