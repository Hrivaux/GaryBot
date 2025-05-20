<?php

namespace App\Controller\Auth;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class RegisterController
{
    public function __construct(
        private UserPasswordHasherInterface $hasher,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function __invoke(Request $req): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        $user = (new User())
            ->setEmail($data['email'] ?? '')
            ->setPassword($data['password'] ?? '')
        ;

        // Validation basique
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return new JsonResponse(['errors' => (string) $errors], 400);
        }

        // Hashage du mot de passe
        $hashed = $this->hasher->hashPassword($user, $user->getPassword());
        $user->setPassword($hashed);

        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(['status' => 'user created'], 201);
    }
}
