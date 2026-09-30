<?php

namespace Tests\Auth;

class LoginTest extends AuthTestCase
{
    public function testLoginWithCorrectPasswordStartsSession(): void
    {
        $email = $this->uniqueEmail();
        $userId = $this->register($email, 'secret123', 'Asha Rai')['body']['user_id'];

        $res = $this->login($email, 'secret123');

        $this->assertSame(200, $res['status']);
        $this->assertTrue($res['body']['success']);
        $this->assertEquals($userId, $res['body']['user_id']);

        $session = $this->client->get('/backend/auth/check_session.php')['body'];
        $this->assertTrue($session['logged_in']);
        $this->assertEquals($userId, $session['user_id']);
        $this->assertSame('Asha Rai', $session['full_name']);
    }

    public function testLoginIgnoresEmailCase(): void
    {
        $email = $this->uniqueEmail();
        $this->register($email);

        $res = $this->login(strtoupper($email), 'secret123');

        $this->assertSame(200, $res['status']);
        $this->assertTrue($res['body']['success']);
    }

    public function testLoginChangesSessionIdToPreventSessionFixation(): void
    {
        $email = $this->uniqueEmail();
        $this->register($email);
        $this->client->get('/backend/auth/check_session.php');
        $before = $this->client->sessionId();

        $this->login($email, 'secret123');

        $this->assertNotNull($before);
        $this->assertNotSame($before, $this->client->sessionId());
    }

    public function testLoginWithWrongPasswordFails(): void
    {
        $email = $this->uniqueEmail();
        $this->register($email);

        $res = $this->login($email, 'wrong-password');

        $this->assertSame(401, $res['status']);
        $this->assertFalse($res['body']['success']);
        $this->assertSame('Invalid email or password.', $res['body']['error']);
        $this->assertFalse($this->client->get('/backend/auth/check_session.php')['body']['logged_in']);
    }

    public function testLoginWithUnknownEmailGivesSameErrorAsWrongPassword(): void
    {
        $res = $this->login($this->uniqueEmail(), 'secret123');

        $this->assertSame(401, $res['status']);
        $this->assertSame('Invalid email or password.', $res['body']['error']);
    }

    public function testLoginRequiresEmailAndPassword(): void
    {
        $noPassword = $this->login($this->uniqueEmail(), '');
        $noEmail = $this->login('', 'secret123');

        foreach ([$noPassword, $noEmail] as $res) {
            $this->assertSame(400, $res['status']);
            $this->assertSame('Email and password are required.', $res['body']['error']);
        }
    }

    public function testLogoutEndsSession(): void
    {
        $email = $this->uniqueEmail();
        $this->register($email);
        $this->login($email, 'secret123');

        $res = $this->client->get('/backend/auth/logout.php');

        $this->assertTrue($res['body']['success']);
        $this->assertFalse($this->client->get('/backend/auth/check_session.php')['body']['logged_in']);
    }

    public function testDemoAccountCanLogIn(): void
    {
        $res = $this->login('demo@example.com', 'demo1234');

        $this->assertSame(200, $res['status']);
        $this->assertTrue($res['body']['success']);
    }
}
