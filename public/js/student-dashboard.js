/**
 * Get initials from a name
 */
function getInitials(name) {
    if (!name) return 'S';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
}

/**
 * Load user information from API
 */
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user', {
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });

        if (response.status === 401) {
            console.warn('API authentication failed, using fallback');
            return;
        }

        if (!response.ok) {
            console.warn('Failed to fetch user info:', response.status);
            return;
        }

        const user = await response.json();

        // Safely update elements only if they exist
        const userNameEl = document.getElementById('userName');
        const profileNameEl = document.getElementById('profileName');
        const userInfoEl = document.getElementById('userInfo');
        const profileAvatarEl = document.getElementById('profileAvatar');

        if (userNameEl && user.full_name) {
            userNameEl.textContent = user.full_name;
        }
        if (profileNameEl && user.full_name) {
            profileNameEl.textContent = user.full_name;
        }
        if (userInfoEl) {
            userInfoEl.textContent = user.student_id ? `ID: ${user.student_id}` : user.email;
        }
        if (profileAvatarEl && user.full_name) {
            profileAvatarEl.textContent = getInitials(user.full_name);
        }
    } catch (error) {
        console.error('Failed to load user:', error);
    }
}

/**
 * Load student request statistics (non-blocking, loads after page renders)
 */
async function loadStatistics() {
    // Only load statistics if the elements exist on the page
    const statsLoader = document.getElementById('statsLoading');
    if (!statsLoader) {
        return;
    }

    try {
        // Load first 5 items of each status to compute totals quickly
        // This is much faster than loading 100 items
        const response = await fetch('/api/tor-requests?per_page=5', {
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load statistics: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Handle paginated response
        const requests = responseData.data || [];
        const total = responseData.total || requests.length;
        
        // Count statuses from what we have
        let pending = 0, processing = 0, completed = 0;
        
        if (Array.isArray(requests)) {
            pending = requests.filter(r => r.status === 'pending').length;
            processing = requests.filter(r => r.status === 'processing').length;
            completed = requests.filter(r => r.status === 'approved' || r.status === 'ready_for_pickup').length;
        }

        const totalEl = document.getElementById('totalRequests');
        const pendingEl = document.getElementById('pendingRequests');
        const processingEl = document.getElementById('processingRequests');
        const completedEl = document.getElementById('completedRequests');
        const statsGridEl = document.getElementById('statsGrid');

        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (processingEl) processingEl.textContent = processing;
        if (completedEl) completedEl.textContent = completed;

        if (statsLoader) statsLoader.style.display = 'none';
        if (statsGridEl) statsGridEl.style.display = 'grid';
    } catch (error) {
        console.error('Failed to load statistics:', error);
        if (statsLoader) {
            statsLoader.textContent = 'No requests yet. Start by creating a new one!';
        }
    }
}

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

/**
 * Handle user logout
 */
window.handleLogout = async function () {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

// Load data on page load
loadUserInfo();

// Load statistics without blocking - fire and forget
// This allows the page to render faster
setTimeout(() => {
    loadStatistics();
}, 100); // Small delay to ensure DOM is ready
