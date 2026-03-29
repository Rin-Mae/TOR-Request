<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    /**
     * Show settings page for admin
     */
    public function show()
    {
        $user = Auth::user();
        return view('admin.settings', compact('user'));
    }

    /**
     * Update admin personal information
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'middle_name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\'-]*$/',
            'last_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'contact_number' => 'required|string|max:20|regex:/^[0-9\s\-\(\)\+]+$/',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, and apostrophes.',
            'middle_name.regex' => 'Middle name can only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, and apostrophes.',
            'contact_number.regex' => 'Contact number can only contain digits, spaces, hyphens, parentheses, and plus sign.',
        ]);

        $user->first_name = $validated['first_name'];
        $user->middle_name = $validated['middle_name'];
        $user->last_name = $validated['last_name'];
        $user->email = $validated['email'];
        $user->contact_number = $validated['contact_number'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Log activity
        ActivityLog::log(
            'updated',
            'Admin updated personal information',
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
