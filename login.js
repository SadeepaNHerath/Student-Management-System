/**
 * Login Script for Student Management System
 * Handles authentication for both students and administrators
 */

// Mock user data for demonstration
// In a real application, this would be verified against a database
const adminUsers = [
    { username: "admin", password: "admin123" }
];

// Some sample student accounts
const studentUsers = [
    { id: "STU001", password: "student123" },
    { id: "STU002", password: "student123" },
    { id: "STU003", password: "student123" }
];

// Login handling logic
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    // For front-end demonstration (will connect to backend later)
    if (userType === 'admin') {
        // Check admin credentials (mock)
        const adminUser = adminUsers.find(admin => admin.username === username && admin.password === password);
        
        if (adminUser) {
            // Store user info in local storage
            localStorage.setItem('userType', 'admin');
            localStorage.setItem('username', username);
            
            // Redirect to admin dashboard
            window.location.href = 'admin_dashboard.html';
        } else {
            alert('Invalid admin credentials. Please try again.');
        }
    } else {
        // Student login (mock)
        const studentUser = studentUsers.find(student => student.id === username && student.password === password);
        
        if (studentUser) {
            // Store user info in local storage
            localStorage.setItem('userType', 'student');
            localStorage.setItem('studentId', username);
            
            // Redirect to student dashboard
            window.location.href = 'student_dashboard.html';
        } else {
            alert('Invalid student credentials. Please try again.');
        }
    }
}

// Check if user is already logged in
function checkLoggedInStatus() {
    const userType = localStorage.getItem('userType');
    
    if (userType) {
        if (userType === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'student_dashboard.html';
        }
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
});
