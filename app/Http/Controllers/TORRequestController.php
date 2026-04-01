<?php

namespace App\Http\Controllers;

use App\Models\TORRequest;
use App\Models\TORRequestDocument;
use App\Models\ActivityLog;
use App\Mail\TORReadyForPickupNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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
     * Store new TOR request with documents
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'birthplace' => 'required|string|max:255',
            'birthdate' => 'required|date|before:today',
            'permanent_address' => 'nullable|string|max:500',
            'student_id' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'degree' => 'nullable|string|max:255',
            'year_of_graduation' => 'nullable|integer|min:1900|max:' . date('Y'),
            'purpose' => 'nullable|string|max:500',
            'birth_certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'receipt' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'requirements' => 'required|array|min:1|max:5',
            'requirements.*' => 'file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
        ], [
            'full_name.required' => 'Full name is required',
            'birthplace.required' => 'Birthplace is required',
            'birthdate.required' => 'Birthdate is required',
            'birthdate.date' => 'Birthdate must be a valid date',
            'birthdate.before' => 'Birthdate must be before today',
            'student_id.required' => 'Student ID is required',
            'course.required' => 'Course is required',
            'birth_certificate.required' => 'Birth certificate is required',
            'birth_certificate.file' => 'Birth certificate must be a file',
            'birth_certificate.mimes' => 'Birth certificate must be a PDF, JPG, JPEG, or PNG file',
            'birth_certificate.max' => 'Birth certificate must not exceed 5MB',
            'receipt.required' => 'Receipt is required',
            'receipt.file' => 'Receipt must be a file',
            'receipt.mimes' => 'Receipt must be a PDF, JPG, JPEG, or PNG file',
            'receipt.max' => 'Receipt must not exceed 5MB',
            'requirements.required' => 'At least one supporting document is required',
            'requirements.array' => 'Requirements must be an array',
            'requirements.min' => 'At least one supporting document is required',
            'requirements.max' => 'Maximum 5 supporting documents allowed',
            'requirements.*.file' => 'Each requirement must be a file',
            'requirements.*.mimes' => 'Each requirement must be a PDF, image, or document file',
            'requirements.*.max' => 'Each requirement must not exceed 5MB',
        ]);

        $torRequest = TORRequest::create([
            'user_id' => auth()->id(),
            ...$validated,
            'status' => 'pending',
        ]);

        // Create documents for birth certificate
        if ($request->hasFile('birth_certificate')) {
            $file = $request->file('birth_certificate');
            $storagePath = 'tor_documents/' . $torRequest->id;
            $fileName = 'birth_certificate_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($storagePath, $fileName, 'public');
            
            TORRequestDocument::create([
                'tor_request_id' => $torRequest->id,
                'document_name' => 'Birth Certificate or Marriage Certificate',
                'file_path' => Storage::url($path),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        // Create documents for receipt
        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            $storagePath = 'tor_documents/' . $torRequest->id;
            $fileName = 'receipt_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($storagePath, $fileName, 'public');
            
            TORRequestDocument::create([
                'tor_request_id' => $torRequest->id,
                'document_name' => 'Receipt',
                'file_path' => Storage::url($path),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        // Create documents for requirements
        if ($request->hasFile('requirements')) {
            foreach ($request->file('requirements') as $file) {
                $storagePath = 'tor_documents/' . $torRequest->id;
                $fileName = 'requirement_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($storagePath, $fileName, 'public');
                
                TORRequestDocument::create([
                    'tor_request_id' => $torRequest->id,
                    'document_name' => $file->getClientOriginalName(),
                    'file_path' => Storage::url($path),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

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
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Check authorization - allow admins or the request owner
        $isAdmin = $user->role === 'admin';
        $isOwner = $torRequest->user_id === $user->id;
        
        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Load documents relationship if requested
        if (request()->has('include') && strpos(request('include'), 'documents') !== false) {
            $torRequest->load('documents');
        }

        return response()->json([
            'data' => $torRequest
        ]);
    }

    /**
     * Get documents for a TOR request
     */
    public function getDocuments(TORRequest $torRequest)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Check authorization - allow admins or the request owner
        $isAdmin = $user->role === 'admin';
        $isOwner = $torRequest->user_id === $user->id;
        
        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Use raw database query to avoid any Eloquent issues
        $documents = DB::table('tor_request_documents')
            ->where('tor_request_id', $torRequest->id)
            ->get();
        
        return response()->json([
            'data' => $documents
        ]);
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