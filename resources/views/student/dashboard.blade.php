<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Student Dashboard - Online TOR Request System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/student-dashboard.css') }}">
</head>

<body>
    <aside class="sidebar">
        <div class="sidebar-header">
            <h1 id="profileName">Student</h1>
            <p class="user-info" id="userInfo"></p>
        </div>

        <ul class="sidebar-menu">
            <li>
                <button onclick="goToDashboard()" type="button">
                    <span>Dashboard</span>
                </button>
            </li>
            <li>
                <button onclick="goToCreateRequest()" type="button">
                    <span>New Request</span>
                </button>
            </li>
            <li>
                <button onclick="goToViewRequests()" type="button">
                    <span>My Requests</span>
                    <span class="badge" id="studentPendingBadge" style="display: none;">0</span>
                </button>
            </li>
            <li>
                <button onclick="goToSettings()" type="button">
                    <span>Settings</span>
                </button>
            </li>
        </ul>

        <button class="logout-btn" onclick="handleLogout()">Logout</button>
    </aside>

    <main class="main-content">
        <div class="container">

            <!-- Statistics Section -->
            <div class="stats-section">
                <h3>Your Request Status</h3>
                <div id="statsLoading" class="loading">Loading your requests...</div>
                <div id="statsGrid" class="stats-grid" style="display: none;">
                    <div class="stat-box">
                        <div class="stat-number" id="totalRequests">0</div>
                        <div class="stat-label">Total Requests</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="pendingRequests">0</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="processingRequests">0</div>
                        <div class="stat-label">Processing</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="completedRequests">0</div>
                        <div class="stat-label">Ready</div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="{{ asset('js/student-dashboard.js') }}"></script>
</body>

</html>