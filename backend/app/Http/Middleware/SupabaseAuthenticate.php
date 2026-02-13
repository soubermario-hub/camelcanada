<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\SupabaseJwtVerifier;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class SupabaseAuthenticate
{
    public function __construct(private readonly SupabaseJwtVerifier $verifier)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->bearerToken();

        if (! $header) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        try {
            $claims = $this->verifier->verify($header);
            $user = User::firstOrCreate(['id' => $claims['sub']], ['email' => $claims['email'] ?? null]);
            Auth::setUser($user);
            $request->attributes->set('auth_claims', $claims);
        } catch (Throwable) {
            return new JsonResponse(['message' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}
