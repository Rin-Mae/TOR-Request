<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    /**
     * Show registration form
     */
    public function show()
    {
        return view('auth.register');
    }

    /**
     * Handle registration request (both web form and API)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'student_id' => 'required|string|unique:users,student_id',
            'contact_number' => 'required|string|max:20',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'student_id' => $validated['student_id'],
            'contact_number' => $validated['contact_number'],
            'role' => 'student', // Default role for new registrations
        ]);

        // Log activity (pass user_id since user isn't authenticated yet)
        ActivityLog::log(
            'created',
            'New user registered: ' . $validated['first_name'] . ' ' . $validated['last_name'],
            'User',
            $user->id,
            null,
            $user->id
        );

        // Log the user in for session
        Auth::login($user, true);

        // Create token for the user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return appropriate response based on request type
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Registration successful',
                'user' => $user,
                'token' => $token,
            ], 201);
        }

        return redirect()->route('student.dashboard')->with('success', 'Registration successful');
    }
}
