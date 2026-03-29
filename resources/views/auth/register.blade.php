<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Register - Online TOR Request System</title>
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
</head>

<body>
    <div class="container">
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="{{ asset('images/NC Logo.png') }}" alt="NC Logo" style="max-width: 150px; height: auto;">
        </div>
        <div id="errorAlert" class="error-alert"></div>
        <div id="successMessage" class="success-message"></div>

        <form id="registerForm" method="POST" action="/register" onsubmit="handleRegisterSubmit(event)">
            @csrf
            <!-- Name Fields Row -->
            <div class="form-row three-columns">
                <div class="form-group">
                    <label for="first_name">First Name</label>
                    <input type="text" id="first_name" name="first_name" class="form-control" required>
                    <div class="error-message" id="first_nameError"></div>
                </div>

                <div class="form-group">
                    <label for="middle_name">Middle Name (Optional)</label>
                    <input type="text" id="middle_name" name="middle_name" class="form-control">
                    <div class="error-message" id="middle_nameError"></div>
                </div>

                <div class="form-group">
                    <label for="last_name">Last Name</label>
                    <input type="text" id="last_name" name="last_name" class="form-control" required>
                    <div class="error-message" id="last_nameError"></div>
                </div>
            </div>

            <!-- Email and Student ID Row -->
            <div class="form-row two-columns">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                    <div class="error-message" id="emailError"></div>
                </div>

                <div class="form-group">
                    <label for="student_id">Student ID</label>
                    <input type="text" id="student_id" name="student_id" class="form-control" required>
                    <div class="error-message" id="student_idError"></div>
                </div>
            </div>

            <!-- Contact Number Row -->
            <div class="form-row two-columns">
                <div class="form-group">
                    <label for="contact_number">Contact Number</label>
                    <input type="tel" id="contact_number" name="contact_number" class="form-control" required
                        pattern="[0-9\-\+\s\(\)]+">
                    <div class="error-message" id="contact_numberError"></div>
                </div>
            </div>

            <!-- Password Row -->
            <div class="form-row two-columns">
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="form-control" required minlength="8">
                    <div class="error-message" id="passwordError"></div>
                </div>

                <div class="form-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" class="form-control"
                        required minlength="8">
                    <div class="error-message" id="password_confirmationError"></div>
                </div>
            </div>

            <button type="submit" id="registerBtn">Create Account</button>
        </form>

        <div style="text-align: center; margin-top: 1rem; color: #666;">
            <p>Already have an account? <a href="/login" style="color: #667eea; text-decoration: none;">Login here</a>
            </p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/auth.js') }}"></script>
</body>

</html>