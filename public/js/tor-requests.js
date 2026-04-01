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
        
        tbody.innerHTML = paginatedRequests.map((req, index) => {
            let approvedByText = '-';
            if (req.approver && req.approver.full_name) {
                approvedByText = req.approver.full_name;
            }
            
            // Calculate row number based on current page and index
            const rowNumber = ((currentPage - 1) * itemsPerPage) + (index + 1);
            
            return `
            <tr>
                <td>${rowNumber}</td>
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
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <i class="fas fa-file-upload" style="font-size: 1.1rem; color: #667eea;"></i>
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
        }
    } catch (error) {
        // Remove loading indicator
        const loadingDiv = document.getElementById('docsLoadingIndicator');
        if (loadingDiv) loadingDiv.remove();
        
        console.error('[Documents] Failed to load documents:', error);
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
const detailsModal = document.getElementById('detailsModal');
if (detailsModal) {
    detailsModal.addEventListener('click', function (e) {
        if (e.target === this) {
            window.closeModal();
        }
    });
}

// Close document preview modal when clicking outside
const documentPreviewModal = document.getElementById('documentPreviewModal');
if (documentPreviewModal) {
    documentPreviewModal.addEventListener('click', function (e) {
        if (e.target === this) {
            window.closeDocumentPreview();
        }
    });
}

// Load data on page load
loadUserInfo();
loadRequests();
