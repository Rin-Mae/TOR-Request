<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index()
    {
        return view('admin.users');
    }

    /**
     * Get all users as JSON (for the table display)
     */
    public function getUsers()
    {
        $users = User::all(['id', 'first_name', 'middle_name', 'last_name', 'email', 'student_id', 'role', 'created_at']);
        
        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Show a single user
     */
    public function show(User $user)
    {
        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Store a newly created user in database
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'middle_name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\'-]*$/',
            'last_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'suffix' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\.]*$/',
            'email' => 'required|email|unique:users,email',
            'student_id' => 'nullable|string|unique:users,student_id',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,student',
        ], [
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, and apostrophes.',
            'middle_name.regex' => 'Middle name can only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, and apostrophes.',
            'suffix.regex' => 'Suffix can only contain letters, spaces, and periods.',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'] ?? null,
            'email' => $validated['email'],
            'student_id' => $validated['student_id'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // Log activity
        ActivityLog::log(
            'created',
            'User created: ' . $validated['first_name'] . ' ' . $validated['last_name'],
            'User',
            $user->id
        );

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Update the specified user in database
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'middle_name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\'-]*$/',
            'last_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'suffix' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\.]*$/',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'student_id' => 'nullable|string|unique:users,student_id,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,student',
        ], [
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, and apostrophes.',
            'middle_name.regex' => 'Middle name can only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, and apostrophes.',
            'suffix.regex' => 'Suffix can only contain letters, spaces, and periods.',
        ]);

        $user->first_name = $validated['first_name'];
        $user->middle_name = $validated['middle_name'] ?? null;
        $user->last_name = $validated['last_name'];
        $user->suffix = $validated['suffix'] ?? null;
        $user->email = $validated['email'];
        $user->student_id = $validated['student_id'] ?? null;
        $user->role = $validated['role'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Log activity
        ActivityLog::log(
            'updated',
            'User updated: ' . $validated['first_name'] . ' ' . $validated['last_name'],
            'User',
            $user->id
        );

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Delete the specified user from database
     */
    public function destroy(User $user)
    {
        // Prevent deleting the currently logged-in admin
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        $userName = $user->first_name . ' ' . $user->last_name;
        $userId = $user->id;

        $user->delete();

        // Log activity
        ActivityLog::log(
            'deleted',
            'User deleted: ' . $userName,
            'User',
            $userId
        );

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}