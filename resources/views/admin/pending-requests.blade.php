<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Pending Requests - Admin Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
                <button onclick="window.location.href='/dashboard'" type="button">
                    <span>Dashboard</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/all-requests'" type="button">
                    <span>All Requests</span>
                </button>
            </li>
            <li>
                <button class="active" onclick="window.location.href='/admin/pending-requests'" type="button">
                    <span>Pending Requests</span>
                    <span class="badge" id="adminPendingBadge" style="display: none;">0</span>
                </button>
            </li>
            <li>
                <button onclick="window.location.href='/admin/processing'" type="button">
                    <span>Processing</span>
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

            <div class="requests-section">
                <h3 style="color: #333; margin-bottom: 1rem;">All Pending Requests</h3>

                <div class="filter-controls">
                    <div class="filter-group" style="flex: 2;">
                        <label for="searchInput">Search (Student ID, Name, Course)</label>
                        <input type="text" id="searchInput" placeholder="Enter search term..." onkeyup="applySearch()">
                    </div>
                </div>

                <div id="loading" class="loading">Loading pending requests...</div>
                <table class="requests-table" id="requestsTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Full Name</th>
                            <th>Course</th>
                            <th>Purpose</th>
                            <th>Status</th>
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

                <div class="empty-state" id="emptyState" style="display: none;">
                    <div class="empty-state-icon">✓</div>
                    <h3 style="color: #666; margin-bottom: 0.5rem;">No Pending Requests</h3>
                    <p>All TOR requests have been processed!</p>
                </div>
            </div>
        </div>
    </main>

    <!-- View TOR Request Details Modal -->
    <div id="detailsModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="closeDetailsModal()">&times;</span>
            <h2>TOR Request Details</h2>
            <div id="detailsContent" style="display: flex; flex-direction: column; gap: 1rem;">
            </div>
        </div>
    </div>

    <!-- Rejection Reason Modal -->
    <div id="rejectionModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="closeRejectionModal()">&times;</span>
            <h2>Reject Request</h2>
            <form onsubmit="submitRejection(event)">
                <div style="margin-bottom: 1.5rem;">
                    <label for="rejectionReason" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Reason
                        for Rejection</label>
                    <textarea id="rejectionReason" required placeholder="Explain why this request is being rejected..."
                        style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; min-height: 120px; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit"
                        style="flex: 1; padding: 0.8rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Reject</button>
                    <button type="button" onclick="closeRejectionModal()"
                        style="flex: 1; padding: 0.8rem; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/admin-common.js') }}"></script>
    <script src="{{ asset('js/admin-pending-requests.js') }}"></script>
</body>

</html>