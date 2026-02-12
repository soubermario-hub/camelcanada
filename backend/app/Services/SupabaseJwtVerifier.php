<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseJwtVerifier
{
    public function verify(string $token): array
    {
        $jwks = Cache::remember('supabase.jwks', 3600, function (): array {
            $url = rtrim(config('services.supabase.url'), '/') . '/auth/v1/.well-known/jwks.json';
            $response = Http::timeout(5)->get($url);

            if (! $response->ok()) {
                throw new RuntimeException('Unable to load Supabase JWKS.');
            }

            return $response->json();
        });

        $keys = JWK::parseKeySet($jwks);
        return (array) JWT::decode($token, $keys);
    }
}
