<?php

    namespace App\State;

    use ApiPlatform\Metadata\Operation;
    use ApiPlatform\State\ProviderInterface;
    use App\Entity\Vehicle;
    use App\Repository\VehicleRepository;
    use App\Repository\UserRepository;
    use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

    class VehicleStateProvider implements ProviderInterface
    {
        public function __construct(
            private VehicleRepository $vehicleRepository,
            private TokenStorageInterface $tokenStorage,
            private UserRepository $userRepo
        ) {}

        public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
        {
            $user = $this->tokenStorage->getToken()?->getUser();
            $user = is_object($user) ? $this->userRepo->find($user->getId()) : null;

            if (!$user) {
                throw new \RuntimeException('Utilisateur non connecté.');
            }

            return $this->vehicleRepository->findBy(['user' => $user]);
        }
    }
