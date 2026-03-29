<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Processing Requests - Admin Dashboard</title>
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
                <button class="active" onclick="window.location.href='/admin/processing'" type="button">
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

            <div class="requests-section">
                <h3 style="color: #333; margin-bottom: 1rem;">Processing Requests</h3>

                <div class="filter-controls">
                    <div class="filter-group" style="flex: 2;">
                        <label for="searchInput">Search (Student ID, Name, Course)</label>
                        <input type="text" id="searchInput" placeholder="Enter search term..." onkeyup="applySearch()">
                    </div>
                </div>

                <div id="loading" class="loading">Loading processing requests...</div>
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
                    <h3 style="color: #666; margin-bottom: 0.5rem;">No Processing Requests</h3>
                    <p>No approved requests are currently being processed!</p>
                </div>
            </div>
        </div>
    </main>

    <!-- View TOR Request Details Modal -->
    <div id="detailsModal" class="modal">
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <span class="close" onclick="closeDetailsModal()">&times;</span>
            <h2>TOR Request Details</h2>
            <div id="detailsContent" style="display: flex; flex-direction: column; gap: 1rem;">
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button type="button" class="btn-primary" style="background-color: #27ae60; display: none;"
                    id="sendEmailBtn" onclick="sendReadyForPickupEmail()">
                    <i class="fas fa-envelope"></i> Send Notification
                </button>
                <button type="button" class="btn-primary" onclick="releaseAndSendEmail()" id="releaseAndSendBtn"
                    style="display: none;">
                    <i class="fas fa-check-circle"></i> Mark Ready & Notify
                </button>
                <button type="button" class="btn-cancel" onclick="closeDetailsModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Document Preview Modal -->
    <div id="documentPreviewModal" class="modal">
        <div class="modal-content" style="max-width: 90%; max-height: 90vh; overflow: auto;">
            <span class="close" onclick="closeDocumentPreview()">&times;</span>
            <h2 id="previewTitle">Document Preview</h2>
            <div id="previewContent" style="margin-top: 1rem;">
                <!-- Preview content will be loaded here -->
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/admin-common.js') }}"></script>
    <script src="{{ asset('js/admin-processing-requests.js') }}"></script>
</body>

</html>