/**
 * Load all TOR requests
 */
let allRequests = [];
let filteredRequests = [];
let currentViewingRequestId = null;
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

async function loadAllRequests(page = 1) {
    try {
        const response = await api.get(`/api/tor-requests?page=${page}&per_page=${itemsPerPage}`);
        allRequests = response.data.data;
        filteredRequests = [...allRequests];
        totalPages = response.data.last_page;
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
        const startIndex = (currentPage - 1) * itemsPerPage;
        
        tbody.innerHTML = paginatedRequests.map((req, index) => `
            <tr>
                <td data-label="No.">${startIndex + index + 1}</td>
                <td data-label="Student ID">${req.student_id || '-'}</td>
                <td data-label="Full Name">${req.full_name}</td>
                <td data-label="Course">${req.course}</td>
                <td data-label="Purpose">${req.purpose || '-'}</td>
                <td data-label="Status"><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></td>
                <td data-label="Actions" class="actions">
                    <button class="btn btn-view" title="View Details" onclick="viewTORRequestDetails(${req.id})"><i class="fas fa-eye"></i></button>
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
 * View TOR request details in modal
 */
window.viewTORRequestDetails = function (id) {
    const req = allRequests.find(r => r.id == id);
    if (!req) return;

    currentViewingRequestId = id;

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
        ${req.remarks ? `<div class="detail-row">
            <div class="detail-label">Remarks:</div>
            <div class="detail-value">${req.remarks}</div>
        </div>` : ''}
    `;

    document.getElementById('torRequestContent').innerHTML = content;
    document.getElementById('torRequestModal').classList.add('show');

    // Show send email button only if status is ready_for_pickup or approved
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.style.display = (req.status === 'ready_for_pickup' || req.status === 'approved') ? 'block' : 'none';
    }
};

/**
 * Close TOR request details modal
 */
window.closeTORRequestModal = function () {
    document.getElementById('torRequestModal').classList.remove('show');
};

/**
 * Open edit TOR request modal
 */
window.openEditTORModal = function () {
    const req = allRequests.find(r => r.id == currentViewingRequestId);
    if (!req) {
        closeTORRequestModal();
        return;
    }

    // Close details modal and open edit modal
    closeTORRequestModal();
    
    // Pre-fill the form with current values
    document.getElementById('torStatus').value = req.status;
    document.getElementById('torRemarks').value = req.remarks || '';
    
    // Clear previous error messages
    document.getElementById('statusError').textContent = '';
    document.getElementById('remarksError').textContent = '';
    
    // Show edit modal
    document.getElementById('editTORModal').classList.add('show');
};

/**
 * Close edit TOR request modal
 */
window.closeEditTORModal = function () {
    document.getElementById('editTORModal').classList.remove('show');
    currentViewingRequestId = null;
    // Reset form
    document.getElementById('editTORForm').reset();
};

/**
 * Send ready-for-pickup email to student
 */
window.sendReadyForPickupEmail = async function () {
    if (!currentViewingRequestId) {
        alert('Error: No request selected');
        return;
    }

    const req = allRequests.find(r => r.id == currentViewingRequestId);
    if (!req) {
        alert('Error: Request not found');
        return;
    }

    // Confirm before sending
    if (!confirm(`Send "Ready for Pickup" notification email to the student?`)) {
        return;
    }

    try {
        const response = await api.post(`/api/tor-requests/${currentViewingRequestId}/send-ready-email`);
        
        // Close modal
        closeTORRequestModal();
        
        // Show success message
        alert(`✓ Email sent successfully!\n\nThe student has been notified that their TOR is ready for pickup.`);
        
    } catch (error) {
        console.error('Failed to send email:', error);
        
        const message = error.response?.data?.message || 'Failed to send email. Please try again.';
        alert('Error: ' + message);
    }
};

/**
 * Handle edit TOR request form submit
 */
window.handleEditTORSubmit = async function (event) {
    event.preventDefault();

    if (!currentViewingRequestId) {
        alert('Error: No request selected');
        return;
    }

    // Clear previous error messages
    document.getElementById('statusError').textContent = '';
    document.getElementById('remarksError').textContent = '';

    const formData = {
        status: document.getElementById('torStatus').value,
        remarks: document.getElementById('torRemarks').value,
    };

    try {
        const response = await api.put(`/api/tor-requests/${currentViewingRequestId}`, formData);
        
        // Update local request data
        const index = allRequests.findIndex(r => r.id == currentViewingRequestId);
        if (index !== -1) {
            allRequests[index] = response.data;
            filteredRequests = [...allRequests];
        }

        closeEditTORModal();
        displayRequests();
        
        // Show success message
        const statusText = formatStatus(formData.status);
        alert(`✓ TOR request status updated to "${statusText}" successfully`);
        
    } catch (error) {
        console.error('Failed to update request:', error);
        
        // Display validation errors
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            Object.keys(errors).forEach(key => {
                const errorElement = document.getElementById(key + 'Error');
                if (errorElement) {
                    errorElement.textContent = errors[key][0] || 'Error updating ' + key;
                }
            });
        } else {
            const message = error.response?.data?.message || 'Failed to update request. Please try again.';
            alert('Error: ' + message);
        }
    }
};

/**
 * Apply the filters function - work with existing implementation
 */
window.applyFilters = function () {
    const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const sortInput = document.getElementById('sortInput')?.value || 'created_at_desc';

    let results = allRequests.filter(req => {
        const matchesSearch = !searchValue ||
            req.student_id.toLowerCase().includes(searchValue) ||
            req.full_name.toLowerCase().includes(searchValue) ||
            req.course.toLowerCase().includes(searchValue);

        const matchesStatus = !statusFilter || req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortInput === 'created_at_desc') {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortInput === 'created_at_asc') {
        results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortInput === 'name_asc') {
        results.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sortInput === 'name_desc') {
        results.sort((a, b) => b.full_name.localeCompare(a.full_name));
    }

    filteredRequests = results;
    displayRequests();
};

/**
 * Clear all filters
 */
window.clearFilters = function () {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortInput').value = 'created_at_desc';
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

window.goToProcessingRequests = function () {
    window.location.href = '/admin/processing-requests';
};

/**
 * Setup sidebar active state
 */
function setupSidebarActive() {
    const buttons = document.querySelectorAll('.sidebar-menu button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.includes('All')) {
            button.classList.add('active');
        }
    });
}

// Setup modal close on outside click
document.addEventListener('click', (e) => {
    const torModal = document.getElementById('torRequestModal');
    const editModal = document.getElementById('editTORModal');
    
    if (e.target === torModal) {
        closeTORRequestModal();
    }
    if (e.target === editModal) {
        closeEditTORModal();
    }
});

/**
 * Go to previous page
 */
window.previousPage = function() {
    if (currentPage > 1) {
        loadAllRequests(currentPage - 1);
        window.scrollTo(0, 0);
    }
};

/**
 * Go to next page
 */
window.nextPage = function() {
    if (currentPage < totalPages) {
        loadAllRequests(currentPage + 1);
        window.scrollTo(0, 0);
    }
};

// Load data on page load
loadUserInfo();
loadAllRequests();
setupSidebarActive();
