/**
 * Admin Dashboard JavaScript
 * Handles functionality for the admin dashboard including:
 * - Loading and managing students
 * - Creating and managing classes
 * - Taking attendance
 * - Processing student requests for classes
 */

// Mock data for demonstration - In a real app, this would come from the backend
let students = [
    { id: "STU001", firstName: "John", lastName: "Doe", contact: "0771234567", classes: ["Web Development", "Java Programming"] },
    { id: "STU002", firstName: "Jane", lastName: "Smith", contact: "0777654321", classes: ["Java Programming"] },
    { id: "STU003", firstName: "Robert", lastName: "Johnson", contact: "0765554433", classes: ["Web Development"] }
];

let classes = [
    { 
        id: "CLS001", 
        name: "Web Development", 
        description: "Learn HTML, CSS, JavaScript", 
        startDate: "2025-01-15", 
        endDate: "2025-06-15",
        schedule: "Mon, Wed 10:00-12:00",
        maxStudents: 25,
        enrolled: 18
    },
    { 
        id: "CLS002", 
        name: "Java Programming", 
        description: "Core Java and Spring Boot", 
        startDate: "2025-02-01", 
        endDate: "2025-07-01",
        schedule: "Tue, Thu 14:00-16:00",
        maxStudents: 20,
        enrolled: 15
    },
    { 
        id: "CLS003", 
        name: "Database Design", 
        description: "SQL and database principles", 
        startDate: "2025-03-15", 
        endDate: "2025-08-15",
        schedule: "Fri 09:00-13:00",
        maxStudents: 15,
        enrolled: 10
    }
];

let requests = [
    { id: "REQ001", studentId: "STU001", studentName: "John Doe", classId: "CLS003", className: "Database Design", date: "2025-05-08", status: "pending" },
    { id: "REQ002", studentId: "STU002", studentName: "Jane Smith", classId: "CLS003", className: "Database Design", date: "2025-05-07", status: "approved" },
    { id: "REQ003", studentId: "STU003", studentName: "Robert Johnson", classId: "CLS002", className: "Java Programming", date: "2025-05-06", status: "rejected" }
];

// Initialize page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for attendance
    document.getElementById('attendanceDate').valueAsDate = new Date();
    
    // Load initial data
    loadDashboardStats();
    loadStudents();
    loadClasses();
    populateClassDropdown();
    loadRequests('pending');
});

// Dashboard stats
function loadDashboardStats() {
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('totalClasses').textContent = classes.length;
    document.getElementById('todayAttendance').textContent = '38'; // Mock data
    document.getElementById('pendingRequests').textContent = requests.filter(req => req.status === 'pending').length;
}

// Student management functions
function loadStudents() {
    const tableBody = document.getElementById('studentTableBody');
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.contact}</td>
            <td>${student.classes.join(', ')}</td>
            <td>
                <div class="buttons are-small">
                    <a href="view_student.html?id=${student.id}" class="button is-info">
                        <span class="icon"><i class="fas fa-eye"></i></span>
                    </a>
                    <button class="button is-warning" onclick="editStudent('${student.id}')">
                        <span class="icon"><i class="fas fa-edit"></i></span>
                    </button>
                    <button class="button is-danger" onclick="deleteStudent('${student.id}')">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function editStudent(id) {
    // In a real app, this would navigate to edit form or open a modal
    alert(`Edit student with ID: ${id}`);
}

function deleteStudent(id) {
    if (confirm(`Are you sure you want to delete student with ID: ${id}?`)) {
        // In a real app, this would send a delete request to the backend
        students = students.filter(student => student.id !== id);
        loadStudents();
        loadDashboardStats();
        alert('Student deleted successfully!');
    }
}

// Class management functions
function loadClasses() {
    const container = document.getElementById('classesContainer');
    container.innerHTML = '';
    
    classes.forEach(cls => {
        const classCard = document.createElement('div');
        classCard.className = 'column is-4';
        
        classCard.innerHTML = `
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">
                        ${cls.name}
                    </p>
                    <button class="card-header-icon" aria-label="more options">
                        <span class="icon">
                            <i class="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </button>
                </header>
                <div class="card-content">
                    <div class="content">
                        <p>${cls.description}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Period:</strong> ${cls.startDate} to ${cls.endDate}</p>
                        <p><strong>Enrollment:</strong> ${cls.enrolled}/${cls.maxStudents}</p>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="card-footer-item" onclick="viewClassDetails('${cls.id}')">View</a>
                    <a href="#" class="card-footer-item" onclick="editClass('${cls.id}')">Edit</a>
                    <a href="#" class="card-footer-item" onclick="deleteClass('${cls.id}')">Delete</a>
                </footer>
            </div>
        `;
        
        container.appendChild(classCard);
    });
}

function showAddClassModal() {
    document.getElementById('addClassModal').classList.add('is-active');
}

function closeAddClassModal() {
    document.getElementById('addClassModal').classList.remove('is-active');
}

function addClass() {
    // Get form values
    const name = document.getElementById('className').value;
    const description = document.getElementById('classDescription').value;
    const startDate = document.getElementById('classStartDate').value;
    const endDate = document.getElementById('classEndDate').value;
    const schedule = document.getElementById('classSchedule').value;
    const maxStudents = document.getElementById('classMaxStudents').value;
    
    if (!name || !description || !startDate || !endDate || !schedule || !maxStudents) {
        alert('Please fill all fields');
        return;
    }
    
    // Generate a new class ID
    const newId = `CLS${String(classes.length + 1).padStart(3, '0')}`;
    
    // Create new class object
    const newClass = {
        id: newId,
        name: name,
        description: description,
        startDate: startDate,
        endDate: endDate,
        schedule: schedule,
        maxStudents: parseInt(maxStudents),
        enrolled: 0
    };
    
    // Add to classes array
    classes.push(newClass);
    
    // Update the UI
    loadClasses();
    populateClassDropdown();
    loadDashboardStats();
    
    // Close the modal
    closeAddClassModal();
    
    alert('Class added successfully!');
}

function viewClassDetails(id) {
    // In a real app, this would navigate to a class details page
    alert(`View class details for ID: ${id}`);
}

function editClass(id) {
    // In a real app, this would open an edit form or modal
    alert(`Edit class with ID: ${id}`);
}

function deleteClass(id) {
    if (confirm(`Are you sure you want to delete class with ID: ${id}?`)) {
        // In a real app, this would send a delete request to the backend
        classes = classes.filter(cls => cls.id !== id);
        loadClasses();
        populateClassDropdown();
        loadDashboardStats();
        alert('Class deleted successfully!');
    }
}

// Attendance management functions
function populateClassDropdown() {
    const select = document.getElementById('classSelect');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add options for each class
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        select.appendChild(option);
    });
}

function loadAttendanceSheet() {
    const classId = document.getElementById('classSelect').value;
    const date = document.getElementById('attendanceDate').value;
    
    if (!classId || !date) {
        alert('Please select a class and date');
        return;
    }
    
    // Show the attendance container
    document.getElementById('attendanceContainer').style.display = 'block';
    
    // Find the selected class
    const selectedClass = classes.find(cls => cls.id === classId);
    
    // Get students in this class
    const studentsInClass = students.filter(student => 
        student.classes.includes(selectedClass.name)
    );
    
    // Populate the attendance table
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';
    
    if (studentsInClass.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="has-text-centered">No students enrolled in this class</td>
            </tr>
        `;
        return;
    }
    
    studentsInClass.forEach(student => {
        const row = document.createElement('tr');
        
        // In a real app, we would check the database for existing attendance records
        // Here we'll just randomize it for demo purposes
        const isPresent = Math.random() > 0.3; // 70% chance of being present
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>
                <span class="tag ${isPresent ? 'is-success' : 'is-danger'}">
                    ${isPresent ? 'Present' : 'Absent'}
                </span>
            </td>
            <td>
                <div class="field">
                    <div class="control">
                        <label class="radio">
                            <input type="radio" name="attendance_${student.id}" value="present" ${isPresent ? 'checked' : ''}>
                            Present
                        </label>
                        <label class="radio">
                            <input type="radio" name="attendance_${student.id}" value="absent" ${!isPresent ? 'checked' : ''}>
                            Absent
                        </label>
                    </div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function saveAttendance() {
    // In a real app, this would send the attendance data to the backend
    alert('Attendance saved successfully!');
}

// Student requests functions
function loadRequests(status = 'pending') {
    // Filter requests by status
    const filteredRequests = requests.filter(req => req.status === status);
    
    // Update active tab
    document.querySelectorAll('.tabs li').forEach(li => li.classList.remove('is-active'));
    document.querySelector(`.tabs li a[onclick="show${status.charAt(0).toUpperCase() + status.slice(1)}Requests()"]`).parentElement.classList.add('is-active');
    
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    
    if (filteredRequests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="has-text-centered">No ${status} requests</td>
            </tr>
        `;
        return;
    }
    
    filteredRequests.forEach(req => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${req.id}</td>
            <td>${req.studentName} (${req.studentId})</td>
            <td>${req.className}</td>
            <td>${req.date}</td>
            <td>
                <div class="buttons are-small">
                    ${status === 'pending' ? `
                        <button class="button is-success" onclick="approveRequest('${req.id}')">
                            <span class="icon"><i class="fas fa-check"></i></span>
                        </button>
                        <button class="button is-danger" onclick="rejectRequest('${req.id}')">
                            <span class="icon"><i class="fas fa-times"></i></span>
                        </button>
                    ` : `
                        <button class="button is-info" onclick="viewRequestDetails('${req.id}')">
                            <span class="icon"><i class="fas fa-eye"></i></span>
                        </button>
                    `}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function showPendingRequests() {
    loadRequests('pending');
}

function showApprovedRequests() {
    loadRequests('approved');
}

function showRejectedRequests() {
    loadRequests('rejected');
}

function approveRequest(id) {
    if (confirm(`Approve request ${id}?`)) {
        // In a real app, this would update the status in the backend
        const requestIndex = requests.findIndex(req => req.id === id);
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'approved';
            loadRequests('pending');
            loadDashboardStats();
            alert('Request approved!');
        }
    }
}

function rejectRequest(id) {
    if (confirm(`Reject request ${id}?`)) {
        // In a real app, this would update the status in the backend
        const requestIndex = requests.findIndex(req => req.id === id);
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'rejected';
            loadRequests('pending');
            loadDashboardStats();
            alert('Request rejected!');
        }
    }
}

function viewRequestDetails(id) {
    // In a real app, this would show detailed information about the request
    alert(`View details for request ${id}`);
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        window.location.href = 'login.html';
    }
}
