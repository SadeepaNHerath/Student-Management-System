/**
 * Login Script for Student Management System
 * Handles authentication for both students and administrators
 */

import {API_BASE_URL} from '../utils/constants.js';
import ApiService from '../services/api.service.js';

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    if (!username || !password) {
        showError('Please enter username and password');
        return;
    }

    const loginBtn = document.getElementById('loginBtn');
    const originalBtnText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Logging in...</span>';

    try {
        const data = await ApiService.login(username, password);
        
        if (!data) {
            throw new Error('Authentication failed');
        }

        if ((userType === 'admin' && data.role !== 'ADMIN') ||
            (userType === 'student' && data.role !== 'STUDENT')) {
            showError(`Invalid credentials for ${userType} login`);
            return;
        }

        window.auth.setAuth({
            role: data.role,
            userId: data.userId,
            studentId: data.studentId
        });

        if (data.role === 'ADMIN') {
            window.location.replace('admin_dashboard.html');
        } else {
            window.location.replace('student_dashboard.html');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid credentials. Please try again.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function checkLoggedInStatus() {
    if (window.auth && window.auth.checkAuth()) {
        window.auth.redirectBasedOnRole();
    }
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        const isInputField = activeElement.tagName === 'INPUT';

        if (isInputField && (activeElement.id === 'username' || activeElement.id === 'password')) {
            event.preventDefault();
            login();
        }
    }
});

window.login = login;
window.checkLoggedInStatus = checkLoggedInStatus;

document.addEventListener('DOMContentLoaded', function () {
    checkLoggedInStatus();

    document.getElementById('username').focus();

    const studentTabLink = document.getElementById('studentTabLink');
    const adminTabLink = document.getElementById('adminTabLink');
    const studentLoginFields = document.getElementById('studentLoginFields');
    const adminLoginFields = document.getElementById('adminLoginFields');

    if (studentTabLink && adminTabLink) {
        studentTabLink.addEventListener('click', function () {
            studentTabLink.classList.add('is-active');
            adminTabLink.classList.remove('is-active');
            studentLoginFields.style.display = 'block';
            adminLoginFields.style.display = 'none';
        });

        adminTabLink.addEventListener('click', function () {
            adminTabLink.classList.add('is-active');
            studentTabLink.classList.remove('is-active');
            adminLoginFields.style.display = 'block';
            studentLoginFields.style.display = 'none';
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            login();
        });
    }
});
