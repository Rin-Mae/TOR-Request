<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tor_requests', function (Blueprint $table) {
            // Add indexes for faster queries if they don't exist
            $indexesList = DB::select("SHOW INDEX FROM tor_requests");
            $indexNames = array_column($indexesList, 'Key_name');
            
            if (!in_array('tor_requests_user_id_index', $indexNames)) {
                $table->index('user_id');
            }
            if (!in_array('tor_requests_status_index', $indexNames)) {
                $table->index('status');
            }
            if (!in_array('tor_requests_user_id_status_index', $indexNames)) {
                $table->index(['user_id', 'status']);
            }
            if (!in_array('tor_requests_created_at_index', $indexNames)) {
                $table->index('created_at');
            }
            if (!in_array('tor_requests_approved_by_index', $indexNames)) {
                $table->index('approved_by');
            }
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            // Add indexes for activity log queries if they don't exist
            $indexesList = DB::select("SHOW INDEX FROM activity_logs");
            $indexNames = array_column($indexesList, 'Key_name');
            
            if (!in_array('activity_logs_created_at_index', $indexNames)) {
                $table->index('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tor_requests', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['approved_by']);
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};

