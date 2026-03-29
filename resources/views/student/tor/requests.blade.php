<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>My TOR Requests - Online TOR Request System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/tor-requests.css') }}">
    <style>
        body {
            background: #f0f8f0;
        }
    </style>
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
            <h2>Your TOR Requests</h2>

            <div id="loading" class="loading">Loading your requests...</div>
            <div id="emptyState" class="empty-state" style="display: none;">
                <p>No TOR requests yet</p>
                <p>Click "New Request" to submit your first request</p>
            </div>

            <table id="requestsTable" class="requests-table" style="display: none;">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Approved By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="requestsBody">
                </tbody>
            </table>

            <!-- Pagination Controls -->
            <div id="requestsPagination" class="pagination-controls" style="display: none;">
                <button id="prevBtn" onclick="previousPage()" class="pagination-btn">← Previous</button>
                <span id="pageInfo" class="pagination-info">Page 1 of 1</span>
                <button id="nextBtn" onclick="nextPage()" class="pagination-btn">Next →</button>
            </div>
        </div>
    </main>

    <!-- Modal for request details -->
    <div id="detailsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Details</h3>
                <button onclick="closeModal()">&times;</button>
            </div>
            <div id="detailsContent"></div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/tor-requests.js') }}"></script>
</body>

</html>