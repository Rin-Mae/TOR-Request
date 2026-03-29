<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - Online TOR Request System</title>
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
</head>

<body>
    <div class="container">
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="{{ asset('images/NC Logo.png') }}" alt="NC Logo" style="max-width: 150px; height: auto;">
        </div>
        <div id="successMessage" class="success-message"></div>
        <div id="errorAlert" class="error-alert"></div>

        <form id="loginForm" onsubmit="handleLoginSubmit(event)">
            @csrf
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="text" id="email" name="email" required>
                <div class="error-message" id="emailError"></div>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <div class="error-message" id="passwordError"></div>
            </div>

            <button type="submit" id="loginBtn">Login</button>
        </form>

        <div style="text-align: center; margin-top: 1rem; color: #666;">
            <p>Don't have an account? <a href="/register" style="color: #667eea; text-decoration: none;">Register
                    here</a></p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/auth.js') }}"></script>
</body>

</html>