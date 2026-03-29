/**
 * Load processing TOR requests
 */
let allRequests = [];
let filteredRequests = [];
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 5;

/**
 * Get paginated requests (already paginated from server)
 */
function getPaginatedRequests() {
    return filteredRequests;
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

async function loadProcessingRequests(page = 1) {
    try {
        // Load both processing and approved requests - only first 5 of each for speed
        // Pagination is handled on the client side after loading
        const [processingRes, approvedRes] = await Promise.all([
            api.get(`/api/tor-requests?status=processing&per_page=5`),
            api.get(`/api/tor-requests?status=approved&per_page=5`)
        ]);
        
        const processingReqs = processingRes.data.data || [];
        const approvedReqs = approvedRes.data.data || [];
        allRequests = [...processingReqs, ...approvedReqs].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        filteredRequests = [...allRequests];
        totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
        currentPage = page;
        displayRequests();
    } catch (error) {
        console.error('Failed to load requests:', error);
        showEmptyState('Failed to load requests');
    }
}

/**
 * Display requests table
 */
function displayRequests() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('requestsTable');
    const tbody = document.getElementById('requestsBody');
    const paginationContainer = document.getElementById('requestsPagination');

    if (loading) loading.style.display = 'none';

    if (filteredRequests.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (table) table.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (table) table.style.display = 'table';
        
        currentPage = 1; // Reset to first page when data changes
        const paginatedRequests = getPaginatedRequests();
        const totalPages = getTotalPages();
        
        tbody.innerHTML = paginatedRequests.map(req => `
            <tr>
                <td data-label="Student ID">${req.student_id || '-'}</td>
                <td data-label="Full Name">${req.full_name}</td>
                <td data-label="Course">${req.course}</td>
                <td data-label="Purpose">${req.purpose || '-'}</td>
                <td data-label="Status"><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></td>
                <td data-label="Actions" class="actions">
                    <button class="btn btn-view" title="View Details" onclick="viewRequestDetails('${req.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-release" title="Mark as Ready" onclick="releaseRequest('${req.id}')"><i class="fas fa-check-circle"></i></button>
                </td>
            </tr>
        `).join('');
        
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
 * View request details in modal
 */
window.viewRequestDetails = function (id) {
    const req = allRequests.find(r => r.id == id);
    if (!req) return;

    window.currentViewingRequestId = id;

    const content = `
        <div class="detail-row">
            <div class="detail-label">Full Name:</div>
            <div class="detail-value">${req.full_name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Student ID:</div>
            <div class="detail-value">${req.student_id || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date of Birth:</div>
            <div class="detail-value">${req.birthdate ? formatDateMMDDYYYY(req.birthdate) : 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Place of Birth:</div>
            <div class="detail-value">${req.birthplace || 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Permanent Address:</div>
            <div class="detail-value">${req.permanent_address || 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Course:</div>
            <div class="detail-value">${req.course}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Purpose:</div>
            <div class="detail-value">${req.purpose || 'N/A'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Requested Date:</div>
            <div class="detail-value">${formatDateMMDDYYYY(req.created_at)}</div>
        </div>
    `;

    document.getElementById('detailsContent').innerHTML = content;
    document.getElementById('detailsModal').classList.add('show');

    // Show appropriate buttons based on status
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const releaseAndSendBtn = document.getElementById('releaseAndSendBtn');
    
    if (sendEmailBtn) {
        sendEmailBtn.style.display = (req.status === 'ready_for_pickup' || req.status === 'approved') ? 'block' : 'none';
    }
    if (releaseAndSendBtn) {
        releaseAndSendBtn.style.display = (req.status === 'processing') ? 'block' : 'none';
    }
};

/**
 * Close details modal
 */
window.closeDetailsModal = function () {
    document.getElementById('detailsModal').classList.remove('show');
};

/**
 * Mark request as ready for pickup
 */
window.releaseRequest = async function (id) {
    if (!confirm('Are you sure you want to mark this request as ready for pickup?')) return;

    try {
        await api.put(`/api/tor-requests/${id}`, { status: 'ready_for_pickup' });
        allRequests = allRequests.filter(r => r.id != id);
        filteredRequests = filteredRequests.filter(r => r.id != id);
        displayRequests();
        closeDetailsModal();
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to update request');
    }
};

/**
 * Send ready-for-pickup email to student
 */
window.sendReadyForPickupEmail = async function () {
    if (!window.currentViewingRequestId) {
        alert('Error: No request selected');
        return;
    }

    const req = allRequests.find(r => r.id == window.currentViewingRequestId);
    if (!req) {
        alert('Error: Request not found');
        return;
    }

    // Confirm before sending
    if (!confirm(`Send "Ready for Pickup" notification email to the student?`)) {
        return;
    }

    try {
        const response = await api.post(`/api/tor-requests/${window.currentViewingRequestId}/send-ready-email`);
        
        // Close modal
        closeDetailsModal();
        
        // Show success message
        alert(`✓ Email sent successfully!\n\nThe student has been notified that their TOR is ready for pickup.`);
        
    } catch (error) {
        console.error('Failed to send email:', error);
        
        const message = error.response?.data?.message || 'Failed to send email. Please try again.';
        alert('Error: ' + message);
    }
};

/**
 * Mark request as ready for pickup AND send email to student
 */
window.releaseAndSendEmail = async function () {
    if (!window.currentViewingRequestId) {
        alert('Error: No request selected');
        return;
    }

    const req = allRequests.find(r => r.id == window.currentViewingRequestId);
    if (!req) {
        alert('Error: Request not found');
        return;
    }

    // Confirm before proceeding
    if (!confirm('Mark this request as ready for pickup and send notification email to the student?')) {
        return;
    }

    try {
        // First, update status to ready_for_pickup
        await api.put(`/api/tor-requests/${window.currentViewingRequestId}`, { status: 'ready_for_pickup' });
        
        // Then send the email
        await api.post(`/api/tor-requests/${window.currentViewingRequestId}/send-ready-email`);
        
        // Remove from list and close modal
        allRequests = allRequests.filter(r => r.id != window.currentViewingRequestId);
        filteredRequests = filteredRequests.filter(r => r.id != window.currentViewingRequestId);
        
        closeDetailsModal();
        displayRequests();
        
        // Show success message
        alert(`✓ Success!\n\nRequest marked as ready for pickup and student has been notified via email.`);
        
    } catch (error) {
        console.error('Failed:', error);
        
        const message = error.response?.data?.message || 'Operation failed. Please try again.';
        alert('Error: ' + message);
    }
};

/**
 * Apply search filter
 */
window.applySearch = function () {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    filteredRequests = allRequests.filter(req =>
        req.student_id.toLowerCase().includes(searchValue) ||
        req.full_name.toLowerCase().includes(searchValue) ||
        req.course.toLowerCase().includes(searchValue)
    );
    displayRequests();
};

/**
 * Clear search filter
 */
window.clearSearch = function () {
    document.getElementById('searchInput').value = '';
    filteredRequests = [...allRequests];
    displayRequests();
};

/**
 * Show empty state message
 */
function showEmptyState(message) {
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('requestsTable');
    if (emptyState) {
        emptyState.textContent = message;
        emptyState.style.display = 'block';
    }
    if (table) table.style.display = 'none';
}

/**
 * Navigation functions
 */
window.goToDashboard = function () {
    window.location.href = '/admin/dashboard';
};

window.goToPendingRequests = function () {
    window.location.href = '/admin/pending-requests';
};

window.goToAllRequests = function () {
    window.location.href = '/admin/all-requests';
};

/**
 * Setup sidebar active state
 */
function setupSidebarActive() {
    const buttons = document.querySelectorAll('.sidebar-menu button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.includes('Processing')) {
            button.classList.add('active');
        }
    });
}

/**
 * Go to previous page
 */
window.previousPage = function() {
    if (currentPage > 1) {
        loadProcessingRequests(currentPage - 1);
        window.scrollTo(0, 0);
    }
};

/**
 * Go to next page
 */
window.nextPage = function() {
    if (currentPage < totalPages) {
        loadProcessingRequests(currentPage + 1);
        window.scrollTo(0, 0);
    }
};

// Load data on page load
loadUserInfo();
loadProcessingRequests();
setupSidebarActive();

// Setup modal close on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('detailsModal');
    if (e.target === modal) {
        closeDetailsModal();
    }
});
