<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TORRequest extends Model
{
    use SoftDeletes;
    protected $table = 'tor_requests';

    protected $fillable = [
        'user_id',
        'full_name',
        'birthplace',
        'permanent_address',
        'birthdate',
        'student_id',
        'course',
        'degree',
        'purpose',
        'status',
        'remarks',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'requested_at' => 'datetime',
        'completed_at' => 'datetime',
        'approved_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the TOR request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who approved the request
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}