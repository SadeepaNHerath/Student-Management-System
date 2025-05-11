/**
 * Main application script for Student Management System
 * Handles global authentication, API calls, and navigation features
 */

import {API_BASE_URL} from './utils/constants.js';
import ApiService from './services/api.service.js';

const auth = {
    isAuthenticated: false,
    userRole: null, // 'ADMIN' or 'STUDENT'
    userId: null,
    studentId: null,

    checkAuth() {
        const authData = localStorage.getItem('auth');
        if (!authData) {
            return false;
        }

        try {
            const data = JSON.parse(authData);
            this.isAuthenticated = true;
            this.userRole = data.role;
            this.userId = data.userId;
            this.studentId = data.studentId;
            return true;
        } catch (error) {
            console.error('Error parsing auth data:', error);
            return false;
        }
    },

    setAuth(data) {
        this.isAuthenticated = true;
        this.userRole = data.role;
        this.userId = data.userId;
        this.studentId = data.studentId;
        localStorage.setItem('auth', JSON.stringify(data));
    },

    clearAuth() {
        this.isAuthenticated = false;
        this.userRole = null;
        this.userId = null;
        this.studentId = null;
        localStorage.removeItem('auth');
    },

    redirectBasedOnRole() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }

        if (this.userRole === 'ADMIN') {
            window.location.href = 'admin_dashboard.html';
        } else if (this.userRole === 'STUDENT') {
            window.location.href = 'student_dashboard.html';
        }
    },

    requireAuth() {
        if (!this.checkAuth()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    requireAdmin() {
        if (!this.checkAuth() || this.userRole !== 'ADMIN') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    requireStudent() {
        if (!this.checkAuth() || this.userRole !== 'STUDENT') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

if (typeof AOS !== 'undefined') {
    AOS.init();
}

if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    if (auth.checkAuth()) {
        auth.redirectBasedOnRole();
    }
}

window.auth = auth;

export { auth as default, auth };