const auth = {
    isAuthenticated: false,
    userRole: null, // 'student' or 'admin'
    userId: null,
    
    // Check if the user is authenticated
    checkAuth() {
        const authData = localStorage.getItem('auth');
        if (!authData) {
            return false;
        }
        
        try {
            const data = JSON.parse(authData);
            this.isAuthenticated = true;
            this.userRole = data.role;
            this.userId = data.id;
            return true;
        } catch (error) {
            console.error('Error parsing auth data:', error);
            return false;
        }
    },
    
    // Set authentication data
    setAuth(role, id) {
        this.isAuthenticated = true;
        this.userRole = role;
        this.userId = id;
        localStorage.setItem('auth', JSON.stringify({ role, id }));
    },
    
    // Clear authentication data
    clearAuth() {
        this.isAuthenticated = false;
        this.userRole = null;
        this.userId = null;
        localStorage.removeItem('auth');
    },
    
    // Redirect based on role
    redirectBasedOnRole() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        
        if (this.userRole === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else if (this.userRole === 'student') {
            window.location.href = 'student_dashboard.html';
        }
    },
    
    // Enforce authentication
    requireAuth() {
        if (!this.checkAuth()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Enforce admin role
    requireAdmin() {
        if (!this.checkAuth() || this.userRole !== 'admin') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Enforce student role
    requireStudent() {
        if (!this.checkAuth() || this.userRole !== 'student') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Initialize AOS animations if it exists
if (typeof AOS !== 'undefined') {
    AOS.init();
}

// Check if we're on the index page and redirect if authenticated
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    if (auth.checkAuth()) {
        auth.redirectBasedOnRole();
    }
}