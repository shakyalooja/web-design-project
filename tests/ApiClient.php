<?php

namespace Tests;

class ApiClient
{
    private string $baseUrl;
    private string $cookieJar;

    public function __construct()
    {
        $this->baseUrl = rtrim(getenv('TEST_BASE_URL'), '/');
        $this->cookieJar = tempnam(sys_get_temp_dir(), 'tp-cookies-');
    }

    public function __destruct()
    {
        @unlink($this->cookieJar);
    }

    /** @return array{status: int, body: array} */
    public function post(string $path, array $body): array
    {
        return $this->send($path, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($body),
        ]);
    }

    /** @return array{status: int, body: array} */
    public function get(string $path): array
    {
        return $this->send($path, []);
    }

    public function sessionId(): ?string
    {
        foreach (file($this->cookieJar) as $line) {
            $parts = explode("\t", trim($line));
            if (count($parts) === 7 && $parts[5] === 'PHPSESSID') {
                return $parts[6];
            }
        }
        return null;
    }

    private function send(string $path, array $options): array
    {
        $ch = curl_init($this->baseUrl . $path);
        curl_setopt_array($ch, $options + [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIEJAR => $this->cookieJar,
            CURLOPT_COOKIEFILE => $this->cookieJar,
            CURLOPT_TIMEOUT => 10,
        ]);
        $raw = curl_exec($ch);
        if ($raw === false) {
            throw new \RuntimeException("Request to $path failed: " . curl_error($ch) . '. Is the app running (docker compose up -d)?');
        }
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        // curl writes the cookie jar to disk only when the handle is freed.
        unset($ch);

        $body = json_decode($raw, true);
        if (!is_array($body)) {
            throw new \RuntimeException("Response from $path is not JSON: $raw");
        }
        return ['status' => $status, 'body' => $body];
    }
}
