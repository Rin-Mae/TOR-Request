<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Settings - Online TOR Request System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/admin-common.css') }}">
    <style>
        .settings-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .settings-card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .settings-card h2 {
            margin-bottom: 1.5rem;
            color: #333;
            font-size: 1.5rem;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .form-row.full {
            grid-template-columns: 1fr;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group label {
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }

        .form-group input {
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group.error input {
            border-color: #e74c3c;
        }

        .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: none;
        }

        .form-group.error .error-message {
            display: block;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
        }

        .form-actions button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5568d3;
        }

        .btn-secondary {
            background: #e8eef7;
            color: #667eea;
        }

        .btn-secondary:hover {
            background: #dce4f0;
        }

        .alert {
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            display: none;
        }

        .alert.show {
            display: block;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .password-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid #667eea;
        }

        .password-section h3 {
            margin-bottom: 1rem;
            color: #333;
        }

        /* Responsive Design */
        @media (max-width: 900px) {
            .settings-container {
                max-width: 100%;
                padding: 0 1rem;
            }

            .settings-card {
                padding: 1.5rem;
            }
        }

        @media (max-width: 768px) {
            .settings-container {
                max-width: 100%;
                padding: 0 1rem;
            }

            .settings-card {
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .settings-card h2 {
                font-size: 1.25rem;
                margin-bottom: 1rem;
            }

            .form-row {
                grid-template-columns: 1fr;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
            }

            .form-group label {
                font-size: 0.9rem;
            }

            .form-group input {
                padding: 0.6rem;
                font-size: 16px;
            }

            .form-actions {
                flex-direction: column;
                gap: 0.75rem;
            }

            .form-actions button {
                padding: 0.7rem 1rem;
                font-size: 0.9rem;
                width: 100%;
            }

            .password-section {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
            }

            .password-section h3 {
                font-size: 1rem;
                margin-bottom: 0.75rem;
            }

            .alert {
                padding: 0.75rem;
                font-size: 0.9rem;
            }
        }

        @media (max-width: 480px) {
            .settings-container {
                padding: 0 0.75rem;
            }

            .settings-card {
                padding: 1rem;
                border-radius: 6px;
            }

            .settings-card h2 {
                font-size: 1.1rem;
                margin-bottom: 1rem;
            }

            .form-group label {
                font-size: 0.85rem;
                margin-bottom: 0.35rem;
            }

            .form-group input {
                padding: 0.5rem;
                font-size: 16px;
                border-radius: 3px;
            }

            .form-actions button {
                padding: 0.6rem 0.8rem;
                font-size: 0.85rem;
            }
        }
    </style>
</head>

<body>
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="profile-avatar" id="profileAvatar">A</div>
            <h1 id="profileName">Admin</h1>
            <p class="user-info" id="userInfo"></p>
        </div>

        <ul class="sidebar-menu">
            <li>
                <button onclick="goToDashboard()" type="button">
                    <span>Dashboard</span>
                </button>
            </li>
            <li>
                <button onclick="goToAllRequests()" type="button">
                    <span>All Requests</span>
                </button>
            </li>
            <li>
                <button onclick="goToPendingRequests()" type="button">
                    <span>Pending Requests</span>
                    <span class="badge" id="adminPendingBadge" style="display: none;">0</span>
                </button>
            </li>
            <li>
                <button onclick="goToProcessing()" type="button">
                    <span>Processing</span>
                </button>
            </li>
            <li>
                <button onclick="goToUserManagement()" type="button">
                    <span>User Management</span>
                </button>
            </li>
            <li>
                <button onclick="goToSettings()" type="button" style="color: #667eea; font-weight: 500;">
                    <span>Settings</span>
                </button>
            </li>
        </ul>

        <button class="logout-btn" onclick="handleLogout()">Logout</button>
    </aside>

    <main class="main-content">
        <div class="container">
            <div class="settings-container">
                <div class="settings-card">
                    <h2><i class="fas fa-cog"></i> Personal Information Settings</h2>

                    <div id="successAlert" class="alert alert-success"></div>
                    <div id="errorAlert" class="alert alert-error"></div>

                    <form id="settingsForm" onsubmit="handleSettingsSubmit(event)">
                        @csrf

                        <h3>Personal Details</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first_name">First Name</label>
                                <input type="text" id="first_name" name="first_name" class="form-control" required>
                                <div class="error-message" id="first_nameError"></div>
                            </div>

                            <div class="form-group">
                                <label for="middle_name">Middle Name</label>
                                <input type="text" id="middle_name" name="middle_name" class="form-control">
                                <div class="error-message" id="middle_nameError"></div>
                            </div>
                        </div>

                        <div class="form-row full">
                            <div class="form-group">
                                <label for="last_name">Last Name</label>
                                <input type="text" id="last_name" name="last_name" class="form-control" required>
                                <div class="error-message" id="last_nameError"></div>
                            </div>
                        </div>

                        <div class="form-row full">
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" name="email" class="form-control" required>
                                <div class="error-message" id="emailError"></div>
                            </div>
                        </div>

                        <div class="form-row full">
                            <div class="form-group">
                                <label for="contact_number">Contact Number</label>
                                <input type="tel" id="contact_number" name="contact_number" class="form-control"
                                    required pattern="[0-9\-\+\s\(\)]+">
                                <div class="error-message" id="contact_numberError"></div>
                            </div>
                        </div>

                        <div class="password-section">
                            <h3>Change Password (Optional)</h3>
                            <p style="color: #666; margin-bottom: 1rem; font-size: 0.9rem;">Leave blank to keep your
                                current password</p>

                            <div class="form-row full">
                                <div class="form-group">
                                    <label for="password">New Password</label>
                                    <input type="password" id="password" name="password" class="form-control"
                                        minlength="8">
                                    <div class="error-message" id="passwordError"></div>
                                </div>
                            </div>

                            <div class="form-row full">
                                <div class="form-group">
                                    <label for="password_confirmation">Confirm Password</label>
                                    <input type="password" id="password_confirmation" name="password_confirmation"
                                        class="form-control" minlength="8">
                                    <div class="error-message" id="password_confirmationError"></div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Save Changes</button>
                            <button type="button" class="btn-secondary"
                                onclick="window.location.href='/dashboard'">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/admin-common.js') }}"></script>
    <script src="{{ asset('js/settings.js') }}"></script>
    <script>
        // Configure axios if not already configured
        let api = window.api || axios.create({
            baseURL: window.location.origin,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });

        // Get CSRF token from meta tag
        const token = document.querySelector('meta[name="csrf-token"]');
        if (token) {
            api.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
        }

        // Add auth token to requests if available
        api.interceptors.request.use(config => {
            const authToken = localStorage.getItem('auth_token');
            if (authToken) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }
            return config;
        });

        // Define navigation functions immediately (before DOMContentLoaded)
        window.handleLogout = function () {
            try {
                api.post('/api/logout').then(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }).catch(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                });
            } catch (error) {
                console.error('Logout error:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        };

        // Load user info on page load
        async function loadUserInfo() {
            try {
                const response = await api.get('/api/user');
                const user = response.data;
                const profileNameEl = document.getElementById('profileName');
                const profileAvatarEl = document.getElementById('profileAvatar');
                const userInfoEl = document.getElementById('userInfo');

                if (profileNameEl) profileNameEl.textContent = user.full_name;
                if (profileAvatarEl) profileAvatarEl.textContent = user.full_name.charAt(0).toUpperCase();
                if (userInfoEl) userInfoEl.textContent = user.email;
            } catch (error) {
                console.error('Failed to load user:', error);
            }
        }

        // Load and pre-fill settings form
        async function loadUserData() {
            try {
                const response = await api.get('/api/user');
                const user = response.data;
                localStorage.setItem('user', JSON.stringify(user));

                // Populate form fields - check if they exist first
                const fields = ['first_name', 'middle_name', 'last_name', 'email', 'contact_number'];
                fields.forEach(field => {
                    const el = document.getElementById(field);
                    if (el) {
                        el.value = user[field] || '';
                    }
                });
            } catch (error) {
                console.error('Failed to load user data:', error);
                // Fallback to localStorage
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        const fields = ['first_name', 'middle_name', 'last_name', 'email', 'contact_number'];
                        fields.forEach(field => {
                            const el = document.getElementById(field);
                            if (el) {
                                el.value = user[field] || '';
                            }
                        });
                    } catch (e) {
                        console.error('Failed to parse stored user data:', e);
                    }
                }
            }
        }

        // Load data when page loads
        document.addEventListener('DOMContentLoaded', function () {
            loadUserInfo();
            loadUserData();
        });
    </script>
</body>

</html>