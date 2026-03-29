<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tor_request_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tor_request_id')->constrained('tor_requests')->onDelete('cascade');
            $table->string('document_name');
            $table->string('file_path');
            $table->string('file_type'); // e.g., pdf, jpg, png, doc
            $table->bigInteger('file_size'); // in bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tor_request_documents');
    }
};
