<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TORRequestDocument extends Model
{
    protected $table = 'tor_request_documents';

    protected $fillable = [
        'tor_request_id',
        'document_name',
        'file_path',
        'file_type',
        'file_size',
    ];

    /**
     * Get the TOR request that owns this document
     */
    public function torRequest(): BelongsTo
    {
        return $this->belongsTo(TORRequest::class);
    }
}
