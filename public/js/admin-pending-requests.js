/**
 * Load pending TOR requests
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

async function loadPendingRequests(page = 1) {
    try {
        const response = await api.get(`/api/tor-requests?status=pending&page=${page}&per_page=${itemsPerPage}`);
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
                    <button class="btn btn-view" title="View Details" onclick="viewRequestDetails('${req.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-approve" title="Approve" onclick="approveRequest('${req.id}')"><i class="fas fa-check"></i></button>
                    <button class="btn btn-cancel" title="Reject" onclick="cancelRequest('${req.id}')"><i class="fas fa-times"></i></button>
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
 * View request details in modal
 */
window.viewRequestDetails = function (id) {
    const req = allRequests.find(r => r.id == id);
    if (!req) {
        alert('Request not found');
        return;
    }

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
    
    // Show loading indicator for documents
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'docsLoadingIndicator';
    loadingDiv.style.marginTop = '2rem';
    loadingDiv.style.paddingTop = '2rem';
    loadingDiv.style.borderTop = '2px solid #ecf0f1';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.innerHTML = `
        <div style="color: #667eea;">
            <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-right: 0.5rem;"></i>
            Loading documents...
        </div>
    `;
    document.getElementById('detailsContent').appendChild(loadingDiv);
    
    // Load documents separately
    loadDocumentsForRequest(id);
};

/**
 * Load and display documents for a TOR request
 */
window.loadDocumentsForRequest = async function (id) {
    try {
        // Remove loading indicator
        const loadingDiv = document.getElementById('docsLoadingIndicator');
        if (loadingDiv) loadingDiv.remove();
        
        console.log('[Documents] Fetching documents for request:', id);
        const response = await api.get(`/api/tor-requests/${id}/documents`);
        console.log('[Documents] API Response status:', response.status);
        console.log('[Documents] API Response data:', response.data);
        
        const documents = response.data.data;
        console.log('[Documents] Documents array:', documents);
        console.log('[Documents] Documents count:', response.data.count);
        
        if (documents && Array.isArray(documents) && documents.length > 0) {
            console.log('[Documents] displaying', documents.length, 'documents');
            const detailsContent = document.getElementById('detailsContent');
            const docsSection = document.createElement('div');
            docsSection.style.marginTop = '2rem';
            docsSection.style.paddingTop = '2rem';
            docsSection.style.borderTop = '2px solid #ecf0f1';
            docsSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <i class="fas fa-file-upload" style="font-size: 1.5rem; color: #667eea;"></i>
                    <div class="detail-label" style="margin: 0; font-size: 0.95rem; color: #2c3e50;">Attached Documents <span style="background: #667eea; color: white; padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.75rem; margin-left: 0.3rem;">${documents.length} file${documents.length !== 1 ? 's' : ''}</span></div>
                </div>
                <div id="documentsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
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
            detailsContent.appendChild(docsSection);
        } else {
            console.log('[Documents] No documents found (count: ' + (documents ? documents.length : 0) + ')');
            // Show message if no documents
            const detailsContent = document.getElementById('detailsContent');
            const noDocsSection = document.createElement('div');
            noDocsSection.style.marginTop = '2rem';
            noDocsSection.style.paddingTop = '2rem';
            noDocsSection.style.borderTop = '2px solid #ecf0f1';
            noDocsSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-file-circle-question" style="font-size: 1.5rem; color: #bdc3c7;"></i>
                    <div class="detail-label" style="margin: 0; font-size: 1rem; color: #7f8c8d;">No documents attached to this request</div>
                </div>
            `;
            detailsContent.appendChild(noDocsSection);
        }
    } catch (error) {
        // Remove loading indicator
        const loadingDiv = document.getElementById('docsLoadingIndicator');
        if (loadingDiv) loadingDiv.remove();
        
        console.error('[Documents] Failed to load documents:', error);
        console.error('[Documents] Error response:', error.response?.data);
        console.error('[Documents] Error message:', error.message);
        console.error('[Documents] Error status:', error.response?.status);
        
        // Show error message to user - but don't fail silently
        const detailsContent = document.getElementById('detailsContent');
        if (detailsContent) {
            const errorSection = document.createElement('div');
            errorSection.style.marginTop = '2rem';
            errorSection.style.paddingTop = '2rem';
            errorSection.style.borderTop = '2px solid #ecf0f1';
            errorSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 1.5rem; color: #e74c3c;"></i>
                    <div>
                        <div class="detail-label" style="margin: 0 0 0.5rem 0; color: #e74c3c;">Failed to load documents</div>
                        <div style="font-size: 0.85rem; color: #c0392b;">${error.response?.data?.message || error.message || 'Unknown error'}</div>
                    </div>
                </div>
            `;
            detailsContent.appendChild(errorSection);
        }
    }
};

/**
 * Close details modal
 */
window.closeDetailsModal = function () {
    document.getElementById('detailsModal').classList.remove('show');
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
 * Approve a pending request
 */
window.approveRequest = async function (id) {
    if (!confirm('Are you sure you want to approve this request?')) return;

    try {
        await api.put(`/api/tor-requests/${id}`, { status: 'processing' });
        allRequests = allRequests.filter(r => r.id != id);
        filteredRequests = filteredRequests.filter(r => r.id != id);
        displayRequests();
        closeDetailsModal();
        
        // Show success notification
        showNotification('✓ Request approved successfully!', 'success', 5000);
    } catch (error) {
        showNotification(error.response?.data?.message || 'Failed to approve request', 'error', 5000);
    }
};

/**
 * reject a pending request
 */
let rejectionRequestId = null;

window.cancelRequest = async function (id) {
    rejectionRequestId = id;
    document.getElementById('rejectionReason').value = '';
    document.getElementById('rejectionModal').classList.add('show');
};

/**
 * Submit rejection with reason
 */
window.submitRejection = async function (event) {
    event.preventDefault();

    if (!rejectionRequestId) return;

    const reason = document.getElementById('rejectionReason').value.trim();

    if (!reason) {
        showNotification('Please provide a reason for rejection', 'error', 5000);
        return;
    }

    try {
        await api.put(`/api/tor-requests/${rejectionRequestId}`, { 
            status: 'rejected',
            remarks: reason
        });
        allRequests = allRequests.filter(r => r.id != rejectionRequestId);
        filteredRequests = filteredRequests.filter(r => r.id != rejectionRequestId);
        displayRequests();
        closeRejectionModal();
        closeDetailsModal();
        
        // Show success notification
        showNotification('✓ Request rejected successfully!', 'success', 5000);
    } catch (error) {
        showNotification(error.response?.data?.message || 'Failed to reject request', 'error', 5000);
    }
};

/**
 * Close rejection modal
 */
window.closeRejectionModal = function () {
    document.getElementById('rejectionModal').classList.remove('show');
    rejectionRequestId = null;
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

window.goToProcessingRequests = function () {
    window.location.href = '/admin/processing-requests';
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
        if (button.textContent.includes('Pending')) {
            button.classList.add('active');
        }
    });
}

/**
 * Go to previous page
 */
window.previousPage = function() {
    if (currentPage > 1) {
        loadPendingRequests(currentPage - 1);
        window.scrollTo(0, 0);
    }
};

/**
 * Go to next page
 */
window.nextPage = function() {
    if (currentPage < totalPages) {
        loadPendingRequests(currentPage + 1);
        window.scrollTo(0, 0);
    }
};

// Load data on page load
loadUserInfo();
loadPendingRequests();
setupSidebarActive();
startBadgeUpdate();

// Setup modal close on outside click
document.addEventListener('click', (e) => {
    const detailsModal = document.getElementById('detailsModal');
    const previewModal = document.getElementById('documentPreviewModal');
    const rejectionModal = document.getElementById('rejectionModal');
    
    if (e.target === detailsModal) {
        closeDetailsModal();
    }
    if (e.target === previewModal) {
        closeDocumentPreview();
    }
    if (e.target === rejectionModal) {
        closeRejectionModal();
    }
});
