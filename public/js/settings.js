/**
 * Load user data into the form
 */
async function loadUserData() {
    try {
        // Try to fetch from API first
        const response = await api.get('/api/user');
        const user = response.data;
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(user));
        
        // Fill form with user data
        populateFormFields(user);
    } catch (error) {
        console.warn('Failed to fetch user data from API, using localStorage:', error);
        
        // Fallback to localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            populateFormFields(user);
        }
    }
}

/**
 * Populate form fields with user data
 */
function populateFormFields(user) {
    const firstNameEl = document.getElementById('first_name');
    const middleNameEl = document.getElementById('middle_name');
    const lastNameEl = document.getElementById('last_name');
    const suffixEl = document.getElementById('suffix');
    const emailEl = document.getElementById('email');
    const contactNumberEl = document.getElementById('contact_number');
    
    if (firstNameEl) firstNameEl.value = user.first_name || '';
    if (middleNameEl) middleNameEl.value = user.middle_name || '';
    if (lastNameEl) lastNameEl.value = user.last_name || '';
    if (suffixEl) suffixEl.value = user.suffix || '';
    if (emailEl) emailEl.value = user.email || '';
    if (contactNumberEl) contactNumberEl.value = user.contact_number || '';
}

/**
 * Handle settings form submission
 */
window.handleSettingsSubmit = async function (event) {
    event.preventDefault();

    // Clear previous messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('successAlert').classList.remove('show');
    document.getElementById('errorAlert').classList.remove('show');
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));

    const firstName = document.getElementById('first_name')?.value;
    const middleName = document.getElementById('middle_name')?.value;
    const lastName = document.getElementById('last_name')?.value;
    const suffix = document.getElementById('suffix')?.value;
    const email = document.getElementById('email')?.value;
    const contactNumber = document.getElementById('contact_number')?.value;
    const password = document.getElementById('password')?.value;
    const passwordConfirmation = document.getElementById('password_confirmation')?.value;

    // Basic validation
    if (!firstName || !lastName || !email || !contactNumber) {
        showError('Please fill in all required fields');
        return;
    }

    if (password && password !== passwordConfirmation) {
        showFieldError('password_confirmation', 'Passwords do not match');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const response = await api.post('/api/settings', {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            suffix: suffix || null,
            email,
            contact_number: contactNumber,
            password: password || null,
            password_confirmation: passwordConfirmation || null,
        });

        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(response.data.user));

        showSuccess(response.data.message);
        
        // Show success message for 2.5 seconds before redirecting
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2500);
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';

        if (error.response?.status === 422 && error.response?.data?.errors) {
            // Validation errors
            const errors = error.response.data.errors;
            for (const field in errors) {
                showFieldError(field, errors[field][0]);
            }
        } else {
            const message = error.response?.data?.message || 'Failed to update settings. Please try again.';
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
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.textContent = message;
        successAlert.classList.add('show');
        
        // Scroll to top to make sure alert is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Show field-specific error
 */
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const field = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (field) {
        field.closest('.form-group')?.classList.add('error');
    }
}

/**
 * Clear field error
 */
function clearFieldError(fieldName) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const field = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (field) {
        field.closest('.form-group')?.classList.remove('error');
    }
}

/**
 * Setup field error clearing on input
 */
function setupFieldErrorClear() {
    const fields = ['first_name', 'middle_name', 'last_name', 'suffix', 'email', 'contact_number', 'password', 'password_confirmation'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', () => clearFieldError(field));
            element.addEventListener('change', () => clearFieldError(field));
        }
    });
}

// Setup field error clearing and load user data on page load
document.addEventListener('DOMContentLoaded', function () {
    setupFieldErrorClear();
    loadUserData();
});
