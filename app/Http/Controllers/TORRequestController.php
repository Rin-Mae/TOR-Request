<?php

namespace App\Http\Controllers;

use App\Models\TORRequest;
use App\Models\ActivityLog;
use App\Mail\TORReadyForPickupNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TORRequestController extends Controller
{
    /**
     * Show TOR request form
     */
    public function create()
    {
        return view('student.tor.create');
    }

    /**
     * Store new TOR request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'birthplace' => 'required|string|max:255|regex:/^[a-zA-Z\s\'-,\.]+$/',
            'birthdate' => 'required|date|before:today',
            'permanent_address' => 'nullable|string|max:500|regex:/^[a-zA-Z0-9\s\'-,\.]+$/',
            'student_id' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'degree' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\'-]+$/',
            'year_of_graduation' => 'nullable|integer|min:1900|max:' . date('Y'),
            'purpose' => 'nullable|string|max:500|regex:/^[a-zA-Z0-9\s\'-,\.]+$/',
        ], [
            'full_name.regex' => 'Full name can only contain letters, spaces, hyphens, and apostrophes.',
            'birthplace.regex' => 'Birthplace can only contain letters, spaces, hyphens, apostrophes, commas, and periods.',
            'permanent_address.regex' => 'Address can only contain letters, numbers, spaces, hyphens, apostrophes, commas, and periods.',
            'degree.regex' => 'Degree can only contain letters, spaces, hyphens, and apostrophes.',
            'purpose.regex' => 'Purpose can only contain letters, numbers, spaces, hyphens, apostrophes, commas, and periods.',
        ]);

        $torRequest = TORRequest::create([
            'user_id' => auth()->id(),
            ...$validated,
            'status' => 'pending',
        ]);

        // Log activity
        ActivityLog::log(
            'created',
            'TOR request submitted for ' . $validated['full_name'],
            'TORRequest',
            $torRequest->id
        );

        return response()->json([
            'message' => 'TOR request submitted successfully',
            'request' => $torRequest,
        ], 201);
    }

    /**
     * Get all TOR requests for the authenticated user or all requests for admin
     * Supports server-side pagination and optional status filtering for faster page loads
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $perPage = (int) $request->get('per_page', 5);
        $page = (int) $request->get('page', 1);
        $status = $request->get('status'); // Optional status filter

        // Base query
        $query = TORRequest::withoutTrashed()->with('approver');

        // Apply status filter if provided
        if ($status) {
            $query->where('status', $status);
        }

        // If admin, return all requests; otherwise return only user's requests
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $torRequests = $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $page);

        return response()->json($torRequests);
    }

    /**
     * Get a single TOR request
     */
    public function show(TORRequest $torRequest)
    {
        // Check authorization
        if ($torRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($torRequest);
    }

    /**
     * Delete a TOR request (only if pending)
     */
    public function destroy(TORRequest $torRequest)
    {
        // Check authorization
        if ($torRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow deletion of pending requests
        if ($torRequest->status !== 'pending') {
            return response()->json(['message' => 'Cannot delete non-pending requests'], 403);
        }

        // Log activity before deletion
        ActivityLog::log(
            'deleted',
            'TOR request deleted for ' . $torRequest->full_name,
            'TORRequest',
            $torRequest->id
        );

        $torRequest->delete();

        return response()->json(['message' => 'TOR request deleted successfully']);
    }

    /**
     * Update a TOR request (status/remarks) -- admin or owner
     */
    public function update(Request $request, TORRequest $torRequest)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Only admins or the owner can update the request
        if ($user->role !== 'admin' && $torRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,approved,rejected,ready_for_pickup',
            'remarks' => 'nullable|string',
        ]);

        $oldStatus = $torRequest->status;
        
        $torRequest->status = $validated['status'];
        if (array_key_exists('remarks', $validated)) {
            $torRequest->remarks = $validated['remarks'];
        }

        // Track who approved the request
        if (in_array($validated['status'], ['approved', 'ready_for_pickup']) && !$torRequest->approved_by) {
            $torRequest->approved_by = $user->id;
            $torRequest->approved_at = now();
        }

        // set completed_at for terminal statuses
        if (in_array($validated['status'], ['approved', 'ready_for_pickup'])) {
            $torRequest->completed_at = now();
        } else {
            $torRequest->completed_at = null;
        }

        $torRequest->save();

        // Log activity
        ActivityLog::log(
            'updated',
            'Status changed from ' . $oldStatus . ' to ' . $validated['status'],
            'TORRequest',
            $torRequest->id
        );

        return response()->json($torRequest);
    }

    /**
     * Send ready-for-pickup notification email to student
     */
    public function sendReadyForPickupEmail(TORRequest $torRequest)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Only admins can send emails
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Status must be ready_for_pickup or approved
        if (!in_array($torRequest->status, ['ready_for_pickup', 'approved'])) {
            return response()->json([
                'message' => 'Email can only be sent when TOR is ready for pickup or approved'
            ], 422);
        }

        try {
            // Get the user who made the request
            $student = $torRequest->user;
            
            if (!$student || !$student->email) {
                return response()->json([
                    'message' => 'Student email not found'
                ], 422);
            }

            // Send the email
            Mail::to($student->email)->send(new TORReadyForPickupNotification($torRequest));

            // Log activity
            ActivityLog::log(
                'sent_email',
                'Sent ready-for-pickup notification to ' . $student->email,
                'TORRequest',
                $torRequest->id
            );

            return response()->json([
                'message' => 'Email sent successfully to ' . $student->email
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending requests count for badge
     */
    public function getPendingCount()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // If admin, return count of all pending requests; otherwise return count of user's pending requests
        if ($user->role === 'admin') {
            $count = TORRequest::where('status', 'pending')->withoutTrashed()->count();
        } else {
            $count = TORRequest::where('user_id', $user->id)
                ->where('status', 'pending')
                ->withoutTrashed()
                ->count();
        }

        return response()->json([
            'pending_count' => $count,
            'user_role' => $user->role
        ]);
    }
}