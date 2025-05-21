<?php

namespace App\Controller\Auth;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserMeController extends AbstractController
{
    #[Route('/api/me', name: 'api_me_get', methods: ['GET'])]
    public function getMe(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'phone' => $user->getPhone(),
            'street' => $user->getStreet(),
            'postalcode' => $user->getPostalcode(),
            'city' => $user->getCity(),
            'country' => $user->getCountry(),
        ]);
    }

    #[Route('/api/me', name: 'api_me_patch', methods: ['PATCH'])]
    public function updateMe(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['firstname'])) {
            $user->setFirstname($data['firstname']);
        }

        if (isset($data['lastname'])) {
            $user->setLastname($data['lastname']);
        }

        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        if (isset($data['street'])) {
            $user->setStreet($data['street']);
        }

        if (isset($data['postalcode'])) {
            $user->setPostalcode($data['postalcode']);
        }

        if (isset($data['city'])) {
            $user->setCity($data['city']);
        }

        if (isset($data['country'])) {
            $user->setCountry($data['country']);
        }

        // Ne jamais modifier l’email ici sauf si vérification prévue

        // Validation des champs modifiés
        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        $em->flush();

        return $this->json(['message' => 'Informations mises à jour avec succès.']);
    }
}
