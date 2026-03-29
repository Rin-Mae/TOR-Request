/**
 * Load admin dashboard statistics
 */
let allActivityLogs = [];
let activityLogsCurrentPage = 1;
const activityLogsItemsPerPage = 5;

/**
 * Get paginated activity logs
 */
function getPaginatedActivityLogs() {
    const startIndex = (activityLogsCurrentPage - 1) * activityLogsItemsPerPage;
    const endIndex = startIndex + activityLogsItemsPerPage;
    return allActivityLogs.slice(startIndex, endIndex);
}

/**
 * Get total pages for activity logs
 */
function getActivityLogsTotalPages() {
    return Math.ceil(allActivityLogs.length / activityLogsItemsPerPage);
}

async function loadStatistics() {
    try {
        const response = await api.get('/api/tor-requests');
        const requests = response.data;

        // Handle both array and object responses
        const requestList = Array.isArray(requests) ? requests : (requests.data || []);

        const pending = requestList.filter(r => r.status === 'pending').length;
        const forRelease = requestList.filter(r => r.status === 'approved' || r.status === 'ready_for_pickup').length;
        const cancelled = requestList.filter(r => r.status === 'rejected').length;

        // Update stat boxes
        const pendingCount = document.getElementById('pendingCount');
        const forReleaseCount = document.getElementById('forReleaseCount');
        const cancelledCount = document.getElementById('cancelledCount');

        if (pendingCount) pendingCount.textContent = pending;
        if (forReleaseCount) forReleaseCount.textContent = forRelease;
        if (cancelledCount) cancelledCount.textContent = cancelled;

        // Show stats grid and hide loading
        const statsLoading = document.getElementById('statsLoading');
        const statsGrid = document.getElementById('statsGrid');
        if (statsLoading) statsLoading.style.display = 'none';
        if (statsGrid) statsGrid.style.display = 'grid';

    } catch (error) {
        console.error('Failed to load statistics:', error);
        const statsLoading = document.getElementById('statsLoading');
        if (statsLoading) statsLoading.textContent = 'Failed to load statistics';
    }
}

/**
 * Load activity logs
 */
async function loadActivityLogs() {
    try {
        const response = await api.get('/api/admin/activity-logs');
        allActivityLogs = response.data?.activity_logs || [];
        activityLogsCurrentPage = 1;
        displayActivityLogs();

    } catch (error) {
        console.error('Failed to load activity logs:', error);
        const activityLoading = document.getElementById('activityLoading');
        if (activityLoading) {
            activityLoading.textContent = 'Activity logs feature not yet initialized. Please run migrations.';
        }
    }
}

/**
 * Display activity logs with pagination
 */
function displayActivityLogs() {
    const tbody = document.getElementById('activityLogsBody');
    const paginationContainer = document.getElementById('activityLogsPagination');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (allActivityLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">No activity logs found</td></tr>';
        if (paginationContainer) paginationContainer.style.display = 'none';
    } else {
        const paginatedLogs = getPaginatedActivityLogs();
        const totalPages = getActivityLogsTotalPages();
        
        paginatedLogs.forEach(log => {
            const row = document.createElement('tr');
            const actionBadge = `<span class="activity-action ${log.action}">${log.action}</span>`;
            
            row.innerHTML = `
                <td data-label="User">${log.user_name || 'Unknown'}</td>
                <td data-label="Action">${actionBadge}</td>
                <td data-label="Description">${log.description || log.model || '-'}</td>
                <td data-label="Date & Time">${log.created_at || ''}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update pagination controls
        if (paginationContainer) {
            paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
            document.getElementById('activityLogsPageInfo').textContent = `Page ${activityLogsCurrentPage} of ${totalPages}`;
            document.getElementById('activityLogsPrevBtn').disabled = activityLogsCurrentPage === 1;
            document.getElementById('activityLogsNextBtn').disabled = activityLogsCurrentPage === totalPages;
        }
    }

    // Show activity logs and hide loading
    const activityLoading = document.getElementById('activityLoading');
    const activityLogsContainer = document.getElementById('activityLogsContainer');
    if (activityLoading) activityLoading.style.display = 'none';
    if (activityLogsContainer) activityLogsContainer.style.display = 'block';
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

window.goToAllRequests = function () {
    window.location.href = '/admin/all-requests';
};

/**
 * Activity logs pagination
 */
window.previousActivityLogsPage = function() {
    if (activityLogsCurrentPage > 1) {
        activityLogsCurrentPage--;
        displayActivityLogs();
        window.scrollTo(0, 0);
    }
};

window.nextActivityLogsPage = function() {
    const totalPages = getActivityLogsTotalPages();
    if (activityLogsCurrentPage < totalPages) {
        activityLogsCurrentPage++;
        displayActivityLogs();
        window.scrollTo(0, 0);
    }
};

/**
 * Setup sidebar active state
 */
function setupSidebarActive() {
    const currentPath = window.location.pathname;
    const buttons = document.querySelectorAll('.sidebar-menu button');
    
    buttons.forEach(button => {
        button.classList.remove('active');
        if (currentPath.includes('dashboard') && button.textContent.includes('Dashboard')) {
            button.classList.add('active');
        } else if (currentPath.includes('pending') && button.textContent.includes('Pending')) {
            button.classList.add('active');
        } else if (currentPath.includes('processing') && button.textContent.includes('Processing')) {
            button.classList.add('active');
        } else if (currentPath.includes('all-requests') && button.textContent.includes('All')) {
            button.classList.add('active');
        }
    });
}

// Load data on page load
loadUserInfo();
setupSidebarActive();

// Load statistics and activity logs without blocking page render
setTimeout(() => {
    loadStatistics();
    loadActivityLogs();
}, 100);
