/**
 * Load all users
 */
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 5;
let isSearchMode = false;

/**
 * Get paginated users
 */
function getPaginatedUsers() {
    const usersToDisplay = isSearchMode ? filteredUsers : allUsers;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return usersToDisplay.slice(startIndex, endIndex);
}

/**
 * Get total pages
 */
function getTotalPages() {
    const usersToDisplay = isSearchMode ? filteredUsers : allUsers;
    return Math.ceil(usersToDisplay.length / itemsPerPage);
}

async function loadUsers() {
    try {
        const response = await api.get('/api/admin/users');
        allUsers = response.data.users;
        currentPage = 1;
        displayUsers();
    } catch (error) {
        showError('Failed to load users: ' + (error.response?.data?.message || error.message));
    }
}

/**
 * Display users in table with pagination
 */
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    const paginationContainer = document.getElementById('usersPagination');
    const usersToDisplay = isSearchMode ? filteredUsers : allUsers;
    
    tbody.innerHTML = '';

    if (usersToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No users found</td></tr>';
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    }

    const paginatedUsers = getPaginatedUsers();
    const totalPages = getTotalPages();
    
    paginatedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="First Name">${user.first_name}</td>
            <td data-label="Middle Name">${user.middle_name || '-'}</td>
            <td data-label="Last Name">${user.last_name}</td>
            <td data-label="Email">${user.email}</td>
            <td data-label="Student ID">${user.student_id || '-'}</td>
            <td data-label="Role"><span class="role-badge ${user.role}">${user.role}</span></td>
            <td data-label="Actions">
                <button onclick="editUser(${user.id})" class="btn-edit" title="Edit User"><i class="fas fa-edit"></i></button>
                <button onclick="deleteUser(${user.id})" class="btn-delete" title="Delete User"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update pagination controls
    if (paginationContainer) {
        paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = currentPage === totalPages;
    }
}

/**
 * Open modal to add new user
 */
function openAddUserModal() {
    document.getElementById('userId').value = '';
    document.getElementById('userForm').reset();
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('passwordHint').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('passwordConfirm').required = true;
    document.getElementById('userModal').style.display = 'block';
    clearAllErrors();
}

/**
 * Open modal to edit user
 */
async function editUser(userId) {
    try {
        const response = await api.get(`/api/admin/users/${userId}`);
        const user = response.data.user;

        document.getElementById('userId').value = user.id;
        document.getElementById('firstName').value = user.first_name;
        document.getElementById('middleName').value = user.middle_name || '';
        document.getElementById('lastName').value = user.last_name;
        document.getElementById('suffix').value = user.suffix || '';
        document.getElementById('email').value = user.email;
        document.getElementById('studentId').value = user.student_id || '';
        document.getElementById('role').value = user.role;
        document.getElementById('password').value = '';
        document.getElementById('passwordConfirm').value = '';

        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('passwordHint').style.display = 'inline';
        document.getElementById('password').required = false;
        document.getElementById('passwordConfirm').required = false;
        document.getElementById('userModal').style.display = 'block';
        clearAllErrors();
    } catch (error) {
        showError('Failed to load user: ' + (error.response?.data?.message || error.message));
    }
}

/**
 * Close user modal
 */
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

/**
 * Handle user form submission
 */
async function handleUserFormSubmit(event) {
    event.preventDefault();
    clearAllErrors();

    const userId = document.getElementById('userId').value;
    const formData = {
        first_name: document.getElementById('firstName').value,
        middle_name: document.getElementById('middleName').value,
        last_name: document.getElementById('lastName').value,
        suffix: document.getElementById('suffix').value,
        email: document.getElementById('email').value,
        student_id: document.getElementById('studentId').value,
        password: document.getElementById('password').value,
        password_confirmation: document.getElementById('passwordConfirm').value,
        role: document.getElementById('role').value,
    };

    try {
        let response;
        if (userId) {
            response = await api.put(`/api/admin/users/${userId}`, formData);
        } else {
            response = await api.post('/api/admin/users', formData);
        }

        showSuccess(response.data.message);
        closeUserModal();
        loadUsers();
    } catch (error) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
            const errors = error.response.data.errors;
            for (const field in errors) {
                showFieldError(field, errors[field][0]);
            }
        } else {
            showError(error.response?.data?.message || 'Failed to save user');
        }
    }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await api.delete(`/api/admin/users/${userId}`);
        showSuccess(response.data.message);
        loadUsers();
    } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete user');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

/**
 * Show field-specific error
 */
function showFieldError(fieldName, message) {
    const fieldMap = {
        'first_name': 'firstNameError',
        'last_name': 'lastNameError',
        'middle_name': 'middleNameError',
        'email': 'emailError',
        'student_id': 'studentIdError',
        'password': 'passwordError',
        'password_confirmation': 'passwordConfirmError',
        'role': 'roleError',
    };

    const errorElementId = fieldMap[fieldName];
    if (errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

/**
 * Close modal when clicking outside of it
 */
window.onclick = function (event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeUserModal();
    }
};

/**
 * Load users on page load
 */

/**
 * Go to previous page
 */
window.previousPage = function() {
    if (currentPage > 1) {
        currentPage--;
        displayUsers();
        window.scrollTo(0, 0);
    }
};

/**
 * Go to next page
 */
window.nextPage = function() {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
        currentPage++;
        displayUsers();
        window.scrollTo(0, 0);
    }
};

/**
 * Search users by name, email, or student ID
 */
function searchUsers() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchInput) {
        showError('Please enter a search term');
        return;
    }
    
    filteredUsers = allUsers.filter(user => {
        const fullName = `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        const studentId = (user.student_id || '').toLowerCase();
        
        return fullName.includes(searchInput) || 
               email.includes(searchInput) || 
               studentId.includes(searchInput);
    });
    
    isSearchMode = true;
    currentPage = 1;
    displayUsers();
    
    if (filteredUsers.length === 0) {
        showSuccess(`No results matching "${searchInput}"`);
    } else {
        showSuccess(`Found ${filteredUsers.length} user(s)`);
    }
}

/**
 * Clear search and reload all users
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
    isSearchMode = false;
    filteredUsers = [];
    currentPage = 1;
    displayUsers();
    showSuccess('Search cleared');
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadUsers();
    
    // Allow Enter key to trigger search
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
});
