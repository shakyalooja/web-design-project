<?php

namespace Tests\Auth;

use PHPUnit\Framework\Attributes\DataProvider;

class RegisterTest extends AuthTestCase
{
    public function testRegisterCreatesUserWithHashedPassword(): void
    {
        $email = $this->uniqueEmail();

        $res = $this->register($email, 'secret123', 'Asha Rai');

        $this->assertSame(200, $res['status']);
        $this->assertTrue($res['body']['success']);
        $this->assertIsNumeric($res['body']['user_id']);

        $user = $this->findUser($email);
        $this->assertNotNull($user);
        $this->assertSame('Asha Rai', $user['full_name']);
        $this->assertNotSame('secret123', $user['password_hash']);
        $this->assertTrue(password_verify('secret123', $user['password_hash']));
    }

    public function testRegisterStoresEmailInLowerCase(): void
    {
        $email = $this->uniqueEmail();

        $this->register(strtoupper($email));

        $this->assertNotNull($this->findUser($email));
    }

    public function testRegisterRejectsDuplicateEmail(): void
    {
        $email = $this->uniqueEmail();
        $this->register($email);

        $res = $this->register(strtoupper($email));

        $this->assertSame(409, $res['status']);
        $this->assertFalse($res['body']['success']);
        $this->assertSame('That email is already registered.', $res['body']['error']);
    }

    #[DataProvider('invalidRegistrations')]
    public function testRegisterRejectsInvalidInput(array $payload, string $expectedError): void
    {
        $payload += ['full_name' => 'Test User', 'email' => $this->uniqueEmail(), 'password' => 'secret123'];

        $res = $this->client->post('/backend/auth/register.php', $payload);

        $this->assertSame(400, $res['status']);
        $this->assertFalse($res['body']['success']);
        $this->assertSame($expectedError, $res['body']['error']);
        $this->assertNull($this->findUser(strtolower($payload['email'])));
    }

    public static function invalidRegistrations(): array
    {
        return [
            'missing name' => [['full_name' => '   '], 'Full name is required.'],
            'name too long' => [['full_name' => str_repeat('a', 101)], 'Full name must be 100 characters or fewer.'],
            'missing email' => [['email' => ''], 'Email is required.'],
            'invalid email' => [['email' => 'not-an-email'], 'Please enter a valid email address.'],
            'password too short' => [['password' => '1234567'], 'Password must be 8 to 72 characters.'],
            'password too long' => [['password' => str_repeat('a', 73)], 'Password must be 8 to 72 characters.'],
        ];
    }
}
