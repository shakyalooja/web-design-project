<?php

namespace Tests\Auth;

use PDO;
use PHPUnit\Framework\TestCase;
use Tests\ApiClient;

abstract class AuthTestCase extends TestCase
{
    private const EMAIL_DOMAIN = '@phpunit.test';

    protected static PDO $db;
    protected ApiClient $client;

    public static function setUpBeforeClass(): void
    {
        self::$db = new PDO(getenv('TEST_DB_DSN'), getenv('TEST_DB_USER'), getenv('TEST_DB_PASS'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    }

    protected function setUp(): void
    {
        $this->client = new ApiClient();
    }

    protected function tearDown(): void
    {
        $stmt = self::$db->prepare('DELETE FROM users WHERE email LIKE ?');
        $stmt->execute(['%' . self::EMAIL_DOMAIN]);
    }

    protected function uniqueEmail(): string
    {
        return 'user-' . bin2hex(random_bytes(6)) . self::EMAIL_DOMAIN;
    }

    protected function register(string $email, string $password = 'secret123', string $name = 'Test User'): array
    {
        return $this->client->post('/backend/auth/register.php', [
            'full_name' => $name,
            'email' => $email,
            'password' => $password,
        ]);
    }

    protected function login(string $email, string $password): array
    {
        return $this->client->post('/backend/auth/login.php', [
            'email' => $email,
            'password' => $password,
        ]);
    }

    protected function findUser(string $email): ?array
    {
        $stmt = self::$db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
