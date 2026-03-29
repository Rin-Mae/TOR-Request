<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>User Management - Online TOR Request System</title>
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
                <button onclick="window.location.href='/admin/pending-requests'" type="button">
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
                <button onclick="window.location.href='/admin/users'" class="active" type="button">
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>User Management</h2>
                <button onclick="openAddUserModal()" class="btn-primary">+ Add New User</button>
            </div>

            <div id="errorMessage" class="error-alert" style="display: none;"></div>
            <div id="successMessage" class="success-message" style="display: none;"></div>

            <table class="requests-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Middle Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Student ID</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">Loading users...</td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Controls -->
            <div id="usersPagination" class="pagination-controls" style="display: none;">
                <button id="prevBtn" onclick="previousPage()" class="pagination-btn">← Previous</button>
                <span id="pageInfo" class="pagination-info">Page 1 of 1</span>
                <button id="nextBtn" onclick="nextPage()" class="pagination-btn">Next →</button>
            </div>
        </div>
    </main>

    <!-- Add/Edit User Modal -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeUserModal()">&times;</span>
            <h2 id="modalTitle">Add New User</h2>

            <form id="userForm" onsubmit="handleUserFormSubmit(event)">
                <input type="hidden" id="userId">

                <div class="form-row two-columns">
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" name="first_name" required>
                        <div class="error-message" id="firstNameError"></div>
                    </div>

                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" name="last_name" required>
                        <div class="error-message" id="lastNameError"></div>
                    </div>
                </div>

                <div class="form-row two-columns">
                    <div class="form-group">
                        <label for="middleName">Middle Name</label>
                        <input type="text" id="middleName" name="middle_name">
                        <div class="error-message" id="middleNameError"></div>
                    </div>

                    <div class="form-group">
                        <label for="suffix">Suffix</label>
                        <input type="text" id="suffix" name="suffix" placeholder="e.g., Jr., Sr., III">
                        <div class="error-message" id="suffixError"></div>
                    </div>
                </div>

                <div class="form-row two-columns">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                        <div class="error-message" id="emailError"></div>
                    </div>

                    <div class="form-group">
                        <label for="studentId">Student ID</label>
                        <input type="text" id="studentId" name="student_id">
                        <div class="error-message" id="studentIdError"></div>
                    </div>
                </div>

                <div class="form-row two-columns">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" minlength="8">
                        <div class="error-message" id="passwordError"></div>
                        <small id="passwordHint" style="color: #666;">Leave blank to keep current password</small>
                    </div>

                    <div class="form-group">
                        <label for="passwordConfirm">Confirm Password</label>
                        <input type="password" id="passwordConfirm" name="password_confirmation" minlength="8">
                        <div class="error-message" id="passwordConfirmError"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" name="role" required>
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div class="error-message" id="roleError"></div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" class="btn-primary">Save User</button>
                    <button type="button" class="btn-cancel" onclick="closeUserModal()">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/admin-common.js') }}"></script>
    <script src="{{ asset('js/admin-users.js') }}"></script>
</body>

</html>