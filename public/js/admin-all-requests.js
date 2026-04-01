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
        updatePaginationButtons();
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
        
        const paginatedRequests = getPaginatedRequests();
        const tableRowTotalPages = getTotalPages();
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
            paginationContainer.style.display = tableRowTotalPages > 1 ? 'flex' : 'none';
            document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${tableRowTotalPages}`;
        }
        
        updatePaginationButtons();
    }
}

/**
 * Update pagination button states
 */
function updatePaginationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
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

    // Load attached documents
    loadDocumentsForRequest(id);

    // Show send email button only if status is ready_for_pickup or approved
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.style.display = (req.status === 'ready_for_pickup' || req.status === 'approved') ? 'block' : 'none';
    }
};

/**
 * Load documents for a specific request
 */
window.loadDocumentsForRequest = async function (id) {
    try {
        console.log('[Documents] Fetching documents for request:', id);
        const response = await api.get(`/api/tor-requests/${id}/documents`);
        console.log('[Documents] API Response status:', response.status);
        console.log('[Documents] API Response data:', response.data);
        
        const documents = response.data.data;
        console.log('[Documents] Documents array:', documents);
        console.log('[Documents] Documents count:', response.data.count);
        
        if (documents && Array.isArray(documents) && documents.length > 0) {
            console.log('[Documents] displaying', documents.length, 'documents');
            const requestContent = document.getElementById('torRequestContent');
            const docsSection = document.createElement('div');
            docsSection.style.marginTop = '2rem';
            docsSection.style.paddingTop = '2rem';
            docsSection.style.borderTop = '2px solid #ecf0f1';
            docsSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <i class="fas fa-file-upload" style="font-size: 1.5rem; color: #667eea;"></i>
                    <div class="detail-label" style="margin: 0; font-size: 0.95rem; color: #2c3e50;">Attached Documents <span style="background: #667eea; color: white; padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.75rem; margin-left: 0.3rem;">${documents.length} file${documents.length !== 1 ? 's' : ''}</span></div>
                </div>
                <div id="documentsList" class="documents-grid">
                    ${documents.map((doc) => {
                        const filePath = (doc.file_path || '').replace(/'/g, "\\'");
                        const docName = (doc.document_name || 'Unnamed').replace(/'/g, "\\'");
                        const fileType = (doc.file_type || 'unknown').replace(/'/g, "\\'");
                        console.log('[Documents] Creating item for:', docName, 'at:', filePath);
                        return `
                            <div class="document-item" onclick="previewDocument('${filePath}', '${docName}', '${fileType}')">
                                <div class="document-icon">
                                    ${getFileIcon(doc.file_type)}
                                </div>
                                <div class="document-name">${doc.document_name}</div>
                                <div class="document-size">${formatFileSize(doc.file_size)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            requestContent.appendChild(docsSection);
        } else {
            console.log('[Documents] No documents found (count: ' + (documents ? documents.length : 0) + ')');
        }
    } catch (error) {
        console.error('[Documents] Failed to load documents:', error);
        console.error('[Documents] Error response:', error.response?.data);
        console.error('[Documents] Error message:', error.message);
        console.error('[Documents] Error status:', error.response?.status);
        
        // Show error message to user
        const requestContent = document.getElementById('torRequestContent');
        const errorSection = document.createElement('div');
        errorSection.style.marginTop = '1.5rem';
        errorSection.style.paddingTop = '1.5rem';
        errorSection.style.borderTop = '2px solid #eee';
        errorSection.innerHTML = `
            <div class="detail-row">
                <div class="detail-label" style="color: #e74c3c;">Documents:</div>
                <div class="detail-value" style="color: #e74c3c;">Failed to load documents (${error.response?.status || 'error'})</div>
            </div>
        `;
        requestContent.appendChild(errorSection);
    }
};

/**
 * Get file icon based on file type
 */
function getFileIcon(fileType) {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) {
        return '<i class="fas fa-file-pdf" style="font-size: 2.5rem; color: #e74c3c;"></i>';
    } else if (type.includes('image')) {
        return '<i class="fas fa-file-image" style="font-size: 2.5rem; color: #3498db;"></i>';
    } else if (type.includes('word') || type.includes('document')) {
        return '<i class="fas fa-file-word" style="font-size: 2.5rem; color: #2980b9;"></i>';
    } else if (type.includes('sheet') || type.includes('excel')) {
        return '<i class="fas fa-file-excel" style="font-size: 2.5rem; color: #27ae60;"></i>';
    } else {
        return '<i class="fas fa-file" style="font-size: 2.5rem; color: #95a5a6;"></i>';
    }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Preview document in modal
 */
window.previewDocument = function (filePath, fileName, fileType) {
    const previewContent = document.getElementById('previewContent');
    const previewTitle = document.getElementById('previewTitle');
    previewTitle.textContent = 'Preview: ' + fileName;

    const type = fileType.toLowerCase();
    let content = '';

    if (type.includes('image')) {
        content = `<img src="${filePath}" style="max-width: 100%; max-height: 70vh; margin: auto; display: block;">`;
    } else if (type.includes('pdf')) {
        content = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <p style="margin: 1rem 0; font-size: 1.1rem;">PDF Document</p>
                <a href="${filePath}" target="_blank" class="btn btn-primary" style="margin-right: 0.5rem;">
                    <i class="fas fa-external-link-alt"></i> Open PDF
                </a>
                <a href="${filePath}" download class="btn btn-secondary">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        `;
    } else if (type.includes('word') || type.includes('document')) {
        content = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-file-word" style="font-size: 4rem; color: #2980b9; margin-bottom: 1rem;"></i>
                <p style="margin: 1rem 0; font-size: 1.1rem;">Word Document</p>
                <a href="${filePath}" download class="btn btn-primary">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        `;
    } else {
        content = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-file" style="font-size: 4rem; color: #95a5a6; margin-bottom: 1rem;"></i>
                <p style="margin: 1rem 0; font-size: 1.1rem;">${fileName}</p>
                <a href="${filePath}" download class="btn btn-primary">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        `;
    }

    previewContent.innerHTML = content;
    document.getElementById('documentPreviewModal').classList.add('show');
};

/**
 * Close document preview modal
 */
window.closeDocumentPreview = function () {
    document.getElementById('documentPreviewModal').classList.remove('show');
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
    currentPage = 1; // Reset to first page when filters change
    updatePaginationButtons();
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
