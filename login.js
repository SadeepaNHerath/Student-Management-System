/**
 * Login Script for Student Management System
 * Handles authentication for both students and administrators
 */

// Login handling logic
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    if (!username || !password) {
        showError('Please enter username and password');
        return;
    }

    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const originalBtnText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Logging in...</span>';
    
    try {
        // Call the API for authentication
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        
        // Check if the user role matches the selected type
        if ((userType === 'admin' && data.role !== 'ADMIN') || 
            (userType === 'student' && data.role !== 'STUDENT')) {
            showError(`Invalid credentials for ${userType} login`);
            return;
        }
        
        // Store authentication data using the auth object from app.js
        auth.setAuth({
            role: data.role,
            userId: data.userId,
            studentId: data.studentId
        });
        
        // Redirect to the appropriate dashboard
        if (data.role === 'ADMIN') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'student_dashboard.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid credentials. Please try again.');
    } finally {
        // Restore button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
}

// Display error message
function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide the message after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Check if user is already logged in
function checkLoggedInStatus() {
    // Use the auth object from app.js
    if (auth.checkAuth()) {
        auth.redirectBasedOnRole();
    }
}

// Handle Enter key press in login form
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        const isInputField = activeElement.tagName === 'INPUT';
        
        if (isInputField && (activeElement.id === 'username' || activeElement.id === 'password')) {
            event.preventDefault();
            login();
        }
    }
});

// Run check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLoggedInStatus();
    
    // Set focus to username field
    document.getElementById('username').focus();
    
    // Add event listeners for tab switching
    const studentTabLink = document.getElementById('studentTabLink');
    const adminTabLink = document.getElementById('adminTabLink');
    const studentLoginFields = document.getElementById('studentLoginFields');
    const adminLoginFields = document.getElementById('adminLoginFields');
    
    if (studentTabLink && adminTabLink) {
        studentTabLink.addEventListener('click', function() {
            studentTabLink.classList.add('is-active');
            adminTabLink.classList.remove('is-active');
            studentLoginFields.style.display = 'block';
            adminLoginFields.style.display = 'none';
        });
        
        adminTabLink.addEventListener('click', function() {
            adminTabLink.classList.add('is-active');
            studentTabLink.classList.remove('is-active');
            adminLoginFields.style.display = 'block';
            studentLoginFields.style.display = 'none';
        });
    }
    
    // Add form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
});
