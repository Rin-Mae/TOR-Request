<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin Dashboard - Online TOR Request System</title>
    <link rel="stylesheet" href="{{ asset('css/admin-common.css') }}">
</head>

<body>
    <aside class="sidebar">
        <div class="sidebar-header">
            <h1 id="profileName">Admin</h1>
            <p class="user-info" id="userInfo"></p>
        </div>

        <ul class="sidebar-menu">
            <li>
                <button onclick="window.location.href='/dashboard'" class="active" type="button">
                    <span>Dashboard</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/all-requests'" type="button">
                    <span>All Requests</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/processing'" type="button">
                    <span>Processing</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/pending-requests'" type="button">
                    <span>Pending Requests</span>
                    <span class="badge" id="adminPendingBadge" style="display: none;">0</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/users'" type="button">
                    <span>User Management</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/settings'" type="button">
                    <span>Settings</span>
                </button>
            </li>
        </ul>

        <button class="logout-btn" onclick="handleLogout()">Logout</button>
    </aside>

    <main class="main-content">
        <div class="container">
            <!-- Statistics Card -->
            <div class="dashboard-card">
                <h3>All Transcript of Records</h3>
                <div id="statsLoading" class="loading">Loading statistics...</div>
                <div id="statsGrid" class="stats-grid" style="display: none;">
                    <div class="stat-box">
                        <div class="stat-number" id="pendingCount">0</div>
                        <div class="stat-label">Pending Requests</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="forReleaseCount">0</div>
                        <div class="stat-label">Ready for Release</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="cancelledCount">0</div>
                        <div class="stat-label">Cancelled Requests</div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Card -->
            <div class="dashboard-card">
                <h3>Recent Activity</h3>
                <div id="activityLoading" class="loading">Loading activity logs...</div>
                <div id="activityLogsContainer" style="display: none;">
                    <div class="activity-logs-wrapper">
                        <table class="activity-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Description</th>
                                    <th>Date & Time</th>
                                </tr>
                            </thead>
                            <tbody id="activityLogsBody">
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination Controls for Activity Logs -->
                    <div id="activityLogsPagination" class="pagination-controls" style="display: none;">
                        <button id="activityLogsPrevBtn" onclick="previousActivityLogsPage()" class="pagination-btn">←
                            Previous</button>
                        <span id="activityLogsPageInfo" class="pagination-info">Page 1 of 1</span>
                        <button id="activityLogsNextBtn" onclick="nextActivityLogsPage()" class="pagination-btn">Next
                            →</button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/admin-common.js') }}"></script>
    <script src="{{ asset('js/admin-dashboard.js') }}"></script>
</body>

</html>