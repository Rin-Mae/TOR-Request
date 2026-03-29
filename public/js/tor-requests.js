// Configure axios
const api = axios.create({
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

// Handle response errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

let requests = [];
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 5;

/**
 * Get paginated requests (already paginated from server)
 */
function getPaginatedRequests() {
    return requests;
}

/**
 * Get total pages
 */
function getTotalPages() {
    return totalPages;
}

/**
 * Format date to MM/DD/YYYY format
 */
function formatDateMMDDYYYY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

/**
 * Load user information from API
 */
async function loadUserInfo() {
    try {
        const response = await api.get('/api/user');
        const user = response.data;
        const profileNameEl = document.getElementById('profileName');
        const profileAvatarEl = document.getElementById('profileAvatar');
        if (profileNameEl) profileNameEl.textContent = user.full_name;
        if (profileAvatarEl) profileAvatarEl.textContent = user.full_name?.charAt(0).toUpperCase() || 'S';
    } catch (error) {
        console.error('Failed to load user:', error);
        // Don't redirect here - let the interceptor handle 401s
    }
}

/**
 * Load TOR requests with server-side pagination
 */
async function loadRequests(page = 1) {
    try {
        const response = await api.get(`/api/tor-requests?page=${page}&per_page=${itemsPerPage}`);
        requests = response.data.data;
        totalPages = response.data.last_page;
        currentPage = page;
        displayRequests();
    } catch (error) {
        console.error('Failed to load requests:', error);
        // Don't redirect here - let the interceptor handle 401s
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('emptyState');
        if (loading) loading.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.textContent = 'Failed to load requests. Please try again.';
        }
    }
}

/**
 * Display requests in table or empty state
 */
function displayRequests() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('requestsTable');
    const tbody = document.getElementById('requestsBody');
    const paginationContainer = document.getElementById('requestsPagination');

    loading.style.display = 'none';

    if (requests.length === 0) {
        emptyState.style.display = 'block';
        table.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        table.style.display = 'table';
        
        const paginatedRequests = getPaginatedRequests();
        const totalPages = getTotalPages();
        
        tbody.innerHTML = paginatedRequests.map(req => {
            let approvedByText = '-';
            if (req.approver && req.approver.full_name) {
                approvedByText = req.approver.full_name;
            }
            
            return `
            <tr>
                <td>${req.student_id}</td>
                <td>${req.course}</td>
                <td><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></td>
                <td>${approvedByText}</td>
                <td>${formatDateMMDDYYYY(req.created_at)}</td>
                <td class="actions">
                    <button class="btn-view" title="View Details" onclick="viewDetails('${req.id}')"><i class="fas fa-eye"></i></button>
                    ${req.status === 'pending' ? `<button class="btn-delete" title="Delete Request" onclick="deleteRequest('${req.id}')"><i class="fas fa-trash-alt"></i></button>` : ''}
                </td>
            </tr>
        `}).join('');
        
        // Update pagination controls
        if (paginationContainer) {
            paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
            document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
            document.getElementById('prevBtn').disabled = currentPage === 1;
            document.getElementById('nextBtn').disabled = currentPage === totalPages;
        }
    }
}

/**
 * Go to previous page
 */
window.previousPage = function() {
    if (currentPage > 1) {
        loadRequests(currentPage - 1);
        window.scrollTo(0, 0);
    }
};

/**
 * Go to next page
 */
window.nextPage = function() {
    if (currentPage < totalPages) {
        loadRequests(currentPage + 1);
        window.scrollTo(0, 0);
    }
};

/**
 * Format status text for display
 */
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'ready_for_pickup': 'Ready for Pickup'
    };
    return statusMap[status] || status;
}

/**
 * View full request details in modal
 */
window.viewDetails = function (id) {
    const req = requests.find(r => r.id == id);
    if (!req) return;

    const content = `
        <div class="detail-row">
            <div class="detail-label">Full Name:</div>
            <div class="detail-value">${req.full_name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date of Birth:</div>
            <div class="detail-value">${formatDateMMDDYYYY(req.birthdate)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Place of Birth:</div>
            <div class="detail-value">${req.birthplace}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Student ID:</div>
            <div class="detail-value">${req.student_id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Course:</div>
            <div class="detail-value">${req.course}</div>
        </div>
        ${req.degree ? `<div class="detail-row">
            <div class="detail-label">Degree:</div>
            <div class="detail-value">${req.degree}</div>
        </div>` : ''}
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></div>
        </div>
        ${req.status === 'rejected' && req.remarks ? `<div class="detail-row" style="background: #fff3cd; padding: 1rem; border-radius: 4px; border-left: 4px solid #ffc107;">
            <div class="detail-label" style="color: #856404;">Rejection Reason:</div>
            <div class="detail-value" style="color: #856404;">${req.remarks}</div>
        </div>` : req.remarks ? `<div class="detail-row">
            <div class="detail-label">Remarks:</div>
            <div class="detail-value">${req.remarks}</div>
        </div>` : ''}
        <div class="detail-row">
            <div class="detail-label">Requested Date:</div>
            <div class="detail-value">${formatDateMMDDYYYY(req.created_at)}</div>
        </div>
    `;

    document.getElementById('detailsContent').innerHTML = content;
    document.getElementById('detailsModal').classList.add('show');
};

/**
 * Close details modal
 */
window.closeModal = function () {
    document.getElementById('detailsModal').classList.remove('show');
};

/**
 * Delete a TOR request
 */
window.deleteRequest = async function (id) {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
        await api.delete(`/api/tor-requests/${id}`);
        requests = requests.filter(r => r.id != id);
        displayRequests();
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete request');
    }
};

/**
 * Handle user logout
 */
window.handleLogout = async function () {
    try {
        await api.post('/api/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

/**
 * Navigation: Go to dashboard
 */
window.goToDashboard = function () {
    window.location.href = '/dashboard';
};

/**
 * Navigation: Create new request
 */
window.goToCreateRequest = function () {
    window.location.href = '/tor/create';
};

/**
 * Navigation: View all requests
 */
window.goToViewRequests = function () {
    window.location.href = '/tor/requests';
};

/**
 * Navigation: Go to settings
 */
window.goToSettings = function () {
    window.location.href = '/settings';
};

// Close modal when clicking outside
document.getElementById('detailsModal').addEventListener('click', function (e) {
    if (e.target === this) {
        window.closeModal();
    }
});

// Load data on page load
loadUserInfo();
loadRequests();
