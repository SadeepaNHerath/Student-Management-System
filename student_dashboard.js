/**
 * Student Dashboard JavaScript
 * Handles functionality for the student dashboard including:
 * - Displaying and editing profile information
 * - Viewing enrolled classes
 * - Applying for available classes
 * - Viewing attendance history
 */

// Mock data for demonstration - In a real app, this would come from the backend
let currentStudent = {
    id: "STU001",
    firstName: "John",
    lastName: "Doe",
    address: "123 Student Lane, Colombo",
    nic: "997654321V",
    contact: "0771234567",
    dob: "2000-05-15",
    profilePicture: "img src/profile-pic.png"
};

let enrolledClasses = [
    { 
        id: "CLS001", 
        name: "Web Development", 
        schedule: "Mon, Wed 10:00-12:00",
        attendancePercentage: 85
    },
    { 
        id: "CLS002", 
        name: "Java Programming", 
        schedule: "Tue, Thu 14:00-16:00",
        attendancePercentage: 92
    }
];

let availableClasses = [
    { 
        id: "CLS003", 
        name: "Database Design", 
        description: "SQL and database principles", 
        schedule: "Fri 09:00-13:00",
        startDate: "2025-03-15", 
        endDate: "2025-08-15"
    },
    { 
        id: "CLS004", 
        name: "Mobile App Development", 
        description: "Android and iOS development", 
        schedule: "Mon, Wed 14:00-16:00",
        startDate: "2025-06-01", 
        endDate: "2025-11-01"
    }
];

let attendanceRecords = [
    { date: "2025-05-08", className: "Web Development", status: "Present" },
    { date: "2025-05-07", className: "Java Programming", status: "Present" },
    { date: "2025-05-06", className: "Web Development", status: "Present" },
    { date: "2025-05-05", className: "Java Programming", status: "Absent" },
    { date: "2025-05-02", className: "Web Development", status: "Present" },
    { date: "2025-05-01", className: "Java Programming", status: "Present" }
];

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as student
    const userType = localStorage.getItem('userType');
    const studentId = localStorage.getItem('studentId');
    
    if (userType !== 'student') {
        // Redirect to login if not logged in as student
        window.location.href = 'login.html';
        return;
    }
    
    // Load student data based on ID
    loadStudentData(studentId || "STU001"); // Fallback to STU001 for demo
});

// Function to load all student data with the given student ID
function loadStudentData(studentId) {
    // In a real application, this would fetch the student data from a server
    // For now we're using mock data

    // For demonstration, we're simulating a fetch based on studentId
    if (studentId !== "STU001") {
        // If not the default user, we'd update the mock data accordingly
        // This is just a simulation - in a real app we'd fetch from backend
        currentStudent.id = studentId;
        
        // You could add more logic here to simulate different student data
        // based on the student ID that was passed in
        console.log(`Loading data for student with ID: ${studentId}`);
    }
    
    // After fetching/loading the student data, call the individual
    // component loading functions to update the UI
    loadStudentProfile();
    loadEnrolledClasses();
    loadAvailableClasses();
    loadAttendanceHistory();
}

// Profile functions
function loadStudentProfile() {
    document.getElementById('studentName').textContent = `${currentStudent.firstName} ${currentStudent.lastName}`;
    document.getElementById('studentId').textContent = `ID: ${currentStudent.id}`;
    document.getElementById('studentAddress').textContent = currentStudent.address;
    document.getElementById('studentNic').textContent = currentStudent.nic;
    document.getElementById('studentContact').textContent = currentStudent.contact;
    document.getElementById('studentProfilePic').src = currentStudent.profilePicture;
}

// Edit profile button event handler
document.getElementById('editProfileBtn').addEventListener('click', function() {
    openEditProfileModal();
});

function openEditProfileModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal is-active" id="editProfileModal">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Edit Profile</p>
                    <button class="delete" aria-label="close" onclick="closeEditProfileModal()"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">First Name</label>
                        <div class="control">
                            <input class="input" type="text" id="editFirstName" value="${currentStudent.firstName}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Last Name</label>
                        <div class="control">
                            <input class="input" type="text" id="editLastName" value="${currentStudent.lastName}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Address</label>
                        <div class="control">
                            <input class="input" type="text" id="editAddress" value="${currentStudent.address}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Contact</label>
                        <div class="control">
                            <input class="input" type="tel" id="editContact" value="${currentStudent.contact}">
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" onclick="saveProfileChanges()">Save changes</button>
                    <button class="button" onclick="closeEditProfileModal()">Cancel</button>
                </footer>
            </div>
        </div>
    `;
    
    // Add modal to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.remove();
    }
}

function saveProfileChanges() {
    // Get updated values
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const address = document.getElementById('editAddress').value;
    const contact = document.getElementById('editContact').value;
    
    // Update student object (in a real app, this would be sent to the backend)
    currentStudent.firstName = firstName;
    currentStudent.lastName = lastName;
    currentStudent.address = address;
    currentStudent.contact = contact;
    
    // Refresh the UI
    loadStudentProfile();
    
    // Close the modal
    closeEditProfileModal();
    
    // Show success message
    alert('Profile updated successfully!');
}

// Classes functions
function loadEnrolledClasses() {
    const tableBody = document.getElementById('classesTableBody');
    tableBody.innerHTML = '';
    
    if (enrolledClasses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="has-text-centered">You are not enrolled in any classes yet</td>
            </tr>
        `;
        return;
    }
    
    enrolledClasses.forEach(cls => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${cls.name}</td>
            <td>${cls.schedule}</td>
            <td>
                <progress class="progress ${cls.attendancePercentage >= 80 ? 'is-success' : cls.attendancePercentage >= 60 ? 'is-warning' : 'is-danger'}" 
                    value="${cls.attendancePercentage}" max="100">
                    ${cls.attendancePercentage}%
                </progress>
                <p class="has-text-centered">${cls.attendancePercentage}%</p>
            </td>
            <td>
                <button class="button is-small is-info" onclick="viewClassDetails('${cls.id}')">
                    <span class="icon">
                        <i class="fas fa-info-circle"></i>
                    </span>
                    <span>Details</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function viewClassDetails(classId) {
    // In a real app, this would show detailed information about the class
    alert(`View details for class ${classId}`);
}

function loadAvailableClasses() {
    const container = document.getElementById('availableClassesContainer');
    container.innerHTML = '';
    
    if (availableClasses.length === 0) {
        container.innerHTML = `
            <div class="column is-full">
                <p class="has-text-centered">No available classes at the moment</p>
            </div>
        `;
        return;
    }
    
    availableClasses.forEach(cls => {
        const classCard = document.createElement('div');
        classCard.className = 'column is-6';
        
        classCard.innerHTML = `
            <div class="box">
                <h4 class="title is-5">${cls.name}</h4>
                <p>${cls.description}</p>
                <p><strong>Schedule:</strong> ${cls.schedule}</p>
                <p><strong>Period:</strong> ${cls.startDate} to ${cls.endDate}</p>
                <div class="has-text-centered mt-4">
                    <button class="button is-primary is-small" onclick="applyForClass('${cls.id}')">
                        <span class="icon">
                            <i class="fas fa-plus"></i>
                        </span>
                        <span>Apply for this class</span>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(classCard);
    });
}

function applyForClass(classId) {
    // Find the class
    const classToApply = availableClasses.find(cls => cls.id === classId);
    
    if (!classToApply) return;
    
    // In a real app, this would send a request to the backend
    const confirmMsg = `Apply for ${classToApply.name}? 
    
Schedule: ${classToApply.schedule}
Period: ${classToApply.startDate} to ${classToApply.endDate}`;
    
    if (confirm(confirmMsg)) {
        // Simulate sending request
        alert('Application sent successfully! Waiting for admin approval.');
        
        // In a real app, we would update the UI to show pending status
    }
}

// Attendance history functions
function loadAttendanceHistory() {
    // First load the attendance records
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';
    
    if (attendanceRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="has-text-centered">No attendance records found</td>
            </tr>
        `;
        return;
    }
    
    attendanceRecords.forEach(record => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.className}</td>
            <td>
                <span class="tag ${record.status === 'Present' ? 'is-success' : 'is-danger'}">
                    ${record.status}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Then set up the class tabs for filtering
    const tabsList = document.getElementById('classTabsList');
    
    // Get unique class names from enrollment
    const classNames = [...new Set(enrolledClasses.map(cls => cls.name))];
    
    // Add a tab for each class
    classNames.forEach(className => {
        const li = document.createElement('li');
        li.innerHTML = `<a onclick="filterAttendanceByClass('${className}')">${className}</a>`;
        tabsList.appendChild(li);
    });
}

function filterAttendanceByClass(className) {
    // Set active tab
    document.querySelectorAll('#classTabsList li').forEach(li => {
        li.classList.remove('is-active');
    });
    
    if (className === 'all') {
        document.querySelector('#classTabsList li:first-child').classList.add('is-active');
        
        // Show all records
        loadAttendanceHistory();
    } else {
        document.querySelector(`#classTabsList li a[onclick="filterAttendanceByClass('${className}')"]`).parentElement.classList.add('is-active');
        
        // Filter records by class
        const filteredRecords = attendanceRecords.filter(record => record.className === className);
        
        // Update table
        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = '';
        
        if (filteredRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="has-text-centered">No attendance records found for ${className}</td>
                </tr>
            `;
            return;
        }
        
        filteredRecords.forEach(record => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.className}</td>
                <td>
                    <span class="tag ${record.status === 'Present' ? 'is-success' : 'is-danger'}">
                        ${record.status}
                    </span>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

// Update logout function to use the global authentication system
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear session data
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        localStorage.removeItem('studentId');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}