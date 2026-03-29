/**
 * Configure axios with CSRF token
 */
const api = axios.create({
    baseURL: window.location.origin,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }
});

const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    api.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
}

/**
 * Handle login form submission
 */
window.handleLoginSubmit = async function (event) {
    event.preventDefault();

    // Clear previous messages
    const errorAlert = document.getElementById('errorAlert');
    const successMessage = document.getElementById('successMessage');
    if (errorAlert) {
        errorAlert.classList.remove('show');
        errorAlert.textContent = '';
    }
    if (successMessage) {
        successMessage.classList.remove('show');
        successMessage.textContent = '';
    }
    // Clear field errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await api.post('/api/login', { email, password });

        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                const role = response.data.user.role;
                window.location.href = role === 'admin' ? '/admin/dashboard' : '/dashboard';
            }, 500);
        }
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';

        // Show field-specific errors if available
        if (error.response?.status === 422 && error.response?.data?.errors) {
            const errors = error.response.data.errors;
            for (const field in errors) {
                showFieldError(field, errors[field][0]);
            }
        } else {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            showError(message);
        }
    }
};

/**
 * Handle registration form submission
 */
window.handleRegisterSubmit = async function (event) {
    event.preventDefault();

    // Clear previous messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('errorAlert').classList.remove('show');
    document.getElementById('successMessage').classList.remove('show');

    const firstName = document.getElementById('first_name')?.value;
    const middleName = document.getElementById('middle_name')?.value;
    const lastName = document.getElementById('last_name')?.value;
    const email = document.getElementById('email')?.value;
    const studentId = document.getElementById('student_id')?.value;
    const contactNumber = document.getElementById('contact_number')?.value;
    const password = document.getElementById('password')?.value;
    const passwordConfirmation = document.getElementById('password_confirmation')?.value;

    // Basic validation
    if (!firstName || !lastName || !email || !studentId || !contactNumber || !password || !passwordConfirmation) {
        showError('Please fill in all required fields');
        return;
    }

    if (password !== passwordConfirmation) {
        showFieldError('password_confirmation', 'Passwords do not match');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const response = await api.post('/api/register', {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            email,
            student_id: studentId,
            contact_number: contactNumber,
            password,
            password_confirmation: passwordConfirmation,
        });

        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showSuccess('Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 500);
        }
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';

        if (error.response?.status === 422 && error.response?.data?.errors) {
            // Validation errors
            const errors = error.response.data.errors;
            for (const field in errors) {
                showFieldError(field, errors[field][0]);
            }
        } else {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            showError(message);
        }
    }
};

/**
 * Show error alert message
 */
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        errorAlert.textContent = message;
        errorAlert.classList.add('show');
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
    }
}

/**
 * Show field-specific error
 */
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Clear field error
 */
function clearFieldError(fieldName) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Setup field error clearing on input
 */
function setupFieldErrorClear() {
    const fields = ['first_name', 'middle_name', 'last_name', 'email', 'student_id', 'contact_number', 'password', 'password_confirmation'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', () => clearFieldError(field));
            element.addEventListener('change', () => clearFieldError(field));
        }
    });
}

// Setup field error clearing on page load
document.addEventListener('DOMContentLoaded', setupFieldErrorClear);
