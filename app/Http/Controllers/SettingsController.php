<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    /**
     * Show settings page for student
     */
    public function show()
    {
        $user = Auth::user();
        return view('student.settings', compact('user'));
    }

    /**
     * Update student personal information
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'middle_name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\'-]*$/',
            'last_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'suffix' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\.]*$/',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'contact_number' => 'required|string|max:20|regex:/^[0-9\s\-\(\)\+]+$/',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, and apostrophes.',
            'middle_name.regex' => 'Middle name can only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, and apostrophes.',
            'suffix.regex' => 'Suffix can only contain letters, spaces, and periods.',
            'contact_number.regex' => 'Contact number can only contain digits, spaces, hyphens, parentheses, and plus sign.',
        ]);

        $user->first_name = $validated['first_name'];
        $user->middle_name = $validated['middle_name'];
        $user->last_name = $validated['last_name'];
        $user->suffix = $validated['suffix'] ?? null;
        $user->email = $validated['email'];
        $user->contact_number = $validated['contact_number'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Log activity
        ActivityLog::log(
            'updated',
            'User updated personal information',
            'User',
            $user->id,
            null,
            $user->id
        );

        return response()->json([
            'message' => 'Your information has been updated successfully',
            'user' => $user,
        ]);
    }
}
