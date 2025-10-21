<?php

namespace App\Http\Middleware;

use Closure;

class RoleMiddleware
{
    public function handle($request, Closure $next, $role)
    {
        $user = auth()->user();
        if (!$user || strtolower($user->rol) !== strtolower($role)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        return $next($request);
    }
}