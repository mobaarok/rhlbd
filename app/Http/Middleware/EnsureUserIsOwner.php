<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps the "My properties" pages for property owners only.
 * The admin is sent to the admin panel instead (they add listings there).
 *
 * Registered as the "owner" middleware alias in bootstrap/app.php.
 */
class EnsureUserIsOwner
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isAdmin()) {
            return to_route('admin.properties.index');
        }

        return $next($request);
    }
}
