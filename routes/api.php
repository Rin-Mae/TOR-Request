<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TORRequestController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;

// Public API Routes (Authentication)
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// Protected API Routes (Session-based authentication for web)
Route::middleware('auth:web')->group(function () {
    // User Routes
    Route::get('/user', [LoginController::class, 'user']);
    Route::post('/logout', [LoginController::class, 'logout']);

    // Settings Routes
    Route::post('/settings', [SettingsController::class, 'update']);

    // TOR Request Routes
    Route::apiResource('tor-requests', TORRequestController::class);
    Route::get('/tor-requests/{torRequest}/documents', [TORRequestController::class, 'getDocuments']);
    Route::post('/tor-requests/{torRequest}/send-ready-email', [TORRequestController::class, 'sendReadyForPickupEmail']);
    Route::get('/tor-requests-pending-count', [TORRequestController::class, 'getPendingCount']);

    // Admin User Management Routes
    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'getUsers']);
        Route::get('/users/{user}', [UserManagementController::class, 'show']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::put('/users/{user}', [UserManagementController::class, 'update']);
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
        Route::get('/activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'getActivityLogs']);
    });
});
