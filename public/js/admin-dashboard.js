/**
 * Load admin dashboard statistics
 */
let allActivityLogs = [];
let activityLogsCurrentPage = 1;
const activityLogsItemsPerPage = 5;
let statsRefreshInterval = null;
let activityLogsRefreshInterval = null;
const refreshIntervalMs = 5000; // Refresh every 5 seconds

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

// Track previous pending count for new request notifications
let previousPendingCount = 0;

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

        if (pendingCount) {
            const oldValue = parseInt(pendingCount.textContent) || 0;
            pendingCount.textContent = pending;
            
            // Highlight and notify if pending count increased (new request incoming)
            if (pending > oldValue) {
                const newCount = pending - oldValue;
                pendingCount.parentElement.classList.add('highlight-new');
                showNotification(`🔔 ${newCount} new pending request${newCount > 1 ? 's' : ''} received!`, 'success', 5000);
                setTimeout(() => {
                    pendingCount.parentElement.classList.remove('highlight-new');
                }, 2000);
            }
        }
        
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
 * Start real-time statistics updates
 */
function startStatisticsUpdate() {
    // Load immediately
    loadStatistics();
    
    // Refresh every 5 seconds
    statsRefreshInterval = setInterval(() => {
        loadStatistics();
    }, refreshIntervalMs);
}

/**
 * Stop real-time statistics updates
 */
function stopStatisticsUpdate() {
    if (statsRefreshInterval) {
        clearInterval(statsRefreshInterval);
        statsRefreshInterval = null;
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
 * Start real-time activity logs updates
 */
function startActivityLogsUpdate() {
    // Load immediately
    loadActivityLogs();
    
    // Refresh every 5 seconds
    activityLogsRefreshInterval = setInterval(() => {
        loadActivityLogs();
    }, refreshIntervalMs);
}

/**
 * Stop real-time activity logs updates
 */
function stopActivityLogsUpdate() {
    if (activityLogsRefreshInterval) {
        clearInterval(activityLogsRefreshInterval);
        activityLogsRefreshInterval = null;
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

// Add notification container to the page if it doesn't exist
if (!document.getElementById('notificationContainer')) {
    const notification = document.createElement('div');
    notification.id = 'notificationContainer';
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
    document.body.appendChild(notification);
}

// Load statistics and activity logs without blocking page render
setTimeout(() => {
    startStatisticsUpdate();
    startActivityLogsUpdate();
}, 100);

// Cleanup intervals when user navigates away
window.addEventListener('unload', () => {
    stopStatisticsUpdate();
    stopActivityLogsUpdate();
});
