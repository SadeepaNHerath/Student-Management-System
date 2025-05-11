/**
 * Class Management JavaScript
 * Handles functionality for the class management page including:
 * - Creating, editing, and deleting classes
 * - Viewing class details
 * - Managing students in classes
 */

// Mock data for demonstration - In a real app, this would come from the backend
let classes = [
    {
        id: "CLS001",
        name: "Web Development",
        description: "Learn HTML, CSS, JavaScript, and modern front-end frameworks to build responsive websites and web applications.",
        startDate: "2025-01-15",
        endDate: "2025-06-15",
        schedule: "Mon, Wed 10:00-12:00",
        maxStudents: 25,
        enrolled: 18,
        status: "active"
    },
    {
        id: "CLS002",
        name: "Java Programming",
        description: "Comprehensive course covering Core Java and Spring Boot for enterprise application development.",
        startDate: "2025-02-01",
        endDate: "2025-07-01",
        schedule: "Tue, Thu 14:00-16:00",
        maxStudents: 20,
        enrolled: 15,
        status: "active"
    },
    {
        id: "CLS003",
        name: "Database Design",
        description: "Learn SQL fundamentals, database normalization, and database management principles.",
        startDate: "2025-03-15",
        endDate: "2025-08-15",
        schedule: "Fri 09:00-13:00",
        maxStudents: 15,
        enrolled: 10,
        status: "upcoming"
    },
    {
        id: "CLS004",
        name: "Mobile App Development",
        description: "Introduction to Android and iOS development using modern frameworks.",
        startDate: "2025-06-01",
        endDate: "2025-11-01",
        schedule: "Mon, Wed 14:00-16:00",
        maxStudents: 20,
        enrolled: 0,
        status: "upcoming"
    },
    {
        id: "CLS005",
        name: "Python for Data Science",
        description: "Python programming with focus on data analysis, visualization, and machine learning basics.",
        startDate: "2024-09-01",
        endDate: "2025-02-01",
        schedule: "Tue, Thu 09:00-11:00",
        maxStudents: 30,
        enrolled: 30,
        status: "completed"
    }
];

// Sample students for demonstration
let students = [
    { id: "STU001", firstName: "John", lastName: "Doe", contact: "0771234567", enrolledClasses: ["CLS001", "CLS002"] },
    { id: "STU002", firstName: "Jane", lastName: "Smith", contact: "0777654321", enrolledClasses: ["CLS002"] },
    { id: "STU003", firstName: "Robert", lastName: "Johnson", contact: "0765554433", enrolledClasses: ["CLS001"] },
    { id: "STU004", firstName: "Emily", lastName: "Brown", contact: "0772221111", enrolledClasses: ["CLS001", "CLS002", "CLS003"] },
    { id: "STU005", firstName: "Michael", lastName: "Davis", contact: "0773334444", enrolledClasses: [] },
    { id: "STU006", firstName: "Sarah", lastName: "Wilson", contact: "0768889999", enrolledClasses: ["CLS002"] }
];

let currentClassId = "";

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function () {
    loadClasses();
});

// Class management functions
function loadClasses(filter = 'all') {
    const container = document.getElementById('classesContainer');
    container.innerHTML = '';

    // Apply filter
    let filteredClasses = classes;
    if (filter !== 'all') {
        filteredClasses = classes.filter(cls => cls.status === filter);
    }

    if (filteredClasses.length === 0) {
        container.innerHTML = `
            <div class="column is-full">
                <div class="notification is-info is-light">
                    No classes found with the selected filter.
                </div>
            </div>
        `;
        return;
    }

    filteredClasses.forEach(cls => {
        const classCard = document.createElement('div');
        classCard.className = 'column is-4';

        // Determine class card color based on status
        let cardColorClass = 'is-primary';
        if (cls.status === 'upcoming') cardColorClass = 'is-info';
        else if (cls.status === 'completed') cardColorClass = 'is-dark';

        classCard.innerHTML = `
            <div class="card">
                <header class="card-header has-background-${cardColorClass} has-text-white">
                    <p class="card-header-title has-text-white">
                        ${cls.name}
                    </p>
                    <button class="card-header-icon has-text-white" aria-label="more options">
                        <span class="icon">
                            <i class="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </button>
                </header>
                <div class="card-content">
                    <div class="content">
                        <p>${cls.description.substring(0, 100)}${cls.description.length > 100 ? '...' : ''}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Period:</strong> ${cls.startDate} to ${cls.endDate}</p>
                        <p><strong>Enrollment:</strong> ${cls.enrolled}/${cls.maxStudents}</p>
                        <p><strong>Status:</strong> 
                            <span class="tag ${cls.status === 'active' ? 'is-success' : cls.status === 'upcoming' ? 'is-info' : 'is-dark'}">
                                ${cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                            </span>
                        </p>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="card-footer-item" onclick="viewClassDetails('${cls.id}')">Details</a>
                    <a href="#" class="card-footer-item" onclick="openManageStudents('${cls.id}')">Students</a>
                    <a href="#" class="card-footer-item" onclick="editClass('${cls.id}')">Edit</a>
                </footer>
            </div>
        `;

        container.appendChild(classCard);
    });
}

function filterClasses(status) {
    // Update active tab
    document.querySelectorAll('.tabs li').forEach(li => li.classList.remove('is-active'));
    document.querySelector(`.tabs li a[onclick="filterClasses('${status}')"]`).parentElement.classList.add('is-active');

    // Load classes with filter
    loadClasses(status);
}

function searchClasses() {
    const searchTerm = document.getElementById('classSearchInput').value.toLowerCase();

    if (!searchTerm) {
        loadClasses();
        return;
    }

    const container = document.getElementById('classesContainer');
    container.innerHTML = '';

    // Filter classes by search term
    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm) ||
        cls.description.toLowerCase().includes(searchTerm)
    );

    if (filteredClasses.length === 0) {
        container.innerHTML = `
            <div class="column is-full">
                <div class="notification is-info is-light">
                    No classes found matching your search term.
                </div>
            </div>
        `;
        return;
    }

    // Display filtered classes
    filteredClasses.forEach(cls => {
        const classCard = document.createElement('div');
        classCard.className = 'column is-4';

        // Determine class card color based on status
        let cardColorClass = 'is-primary';
        if (cls.status === 'upcoming') cardColorClass = 'is-info';
        else if (cls.status === 'completed') cardColorClass = 'is-dark';

        classCard.innerHTML = `
            <div class="card">
                <header class="card-header has-background-${cardColorClass} has-text-white">
                    <p class="card-header-title has-text-white">
                        ${cls.name}
                    </p>
                    <button class="card-header-icon has-text-white" aria-label="more options">
                        <span class="icon">
                            <i class="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </button>
                </header>
                <div class="card-content">
                    <div class="content">
                        <p>${cls.description.substring(0, 100)}${cls.description.length > 100 ? '...' : ''}</p>
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Period:</strong> ${cls.startDate} to ${cls.endDate}</p>
                        <p><strong>Enrollment:</strong> ${cls.enrolled}/${cls.maxStudents}</p>
                        <p><strong>Status:</strong> 
                            <span class="tag ${cls.status === 'active' ? 'is-success' : cls.status === 'upcoming' ? 'is-info' : 'is-dark'}">
                                ${cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                            </span>
                        </p>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="card-footer-item" onclick="viewClassDetails('${cls.id}')">Details</a>
                    <a href="#" class="card-footer-item" onclick="openManageStudents('${cls.id}')">Students</a>
                    <a href="#" class="card-footer-item" onclick="editClass('${cls.id}')">Edit</a>
                </footer>
            </div>
        `;

        container.appendChild(classCard);
    });
}

// Class details modal
function viewClassDetails(classId) {
    currentClassId = classId;
    const selectedClass = classes.find(cls => cls.id === classId);

    if (!selectedClass) return;

    // Set modal title
    document.getElementById('modalClassTitle').textContent = selectedClass.name;

    // Fill modal content
    const content = document.getElementById('classDetailsContent');
    content.innerHTML = `
        <div class="box">
            <div class="media">
                <div class="media-content">
                    <p class="title is-4">${selectedClass.name}</p>
                    <p class="subtitle is-6">${selectedClass.id}</p>
                </div>
                <div class="media-right">
                    <span class="tag is-medium ${selectedClass.status === 'active' ? 'is-success' : selectedClass.status === 'upcoming' ? 'is-info' : 'is-dark'}">
                        ${selectedClass.status.charAt(0).toUpperCase() + selectedClass.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="content mt-4">
                <p>${selectedClass.description}</p>
                
                <h5 class="title is-5 mt-4">Schedule</h5>
                <p><strong>Days & Time:</strong> ${selectedClass.schedule}</p>
                <p><strong>Start Date:</strong> ${selectedClass.startDate}</p>
                <p><strong>End Date:</strong> ${selectedClass.endDate}</p>
                
                <h5 class="title is-5 mt-4">Enrollment</h5>
                <p><strong>Enrolled Students:</strong> ${selectedClass.enrolled} out of ${selectedClass.maxStudents}</p>
                <progress class="progress ${selectedClass.enrolled >= selectedClass.maxStudents ? 'is-danger' : 'is-success'}" 
                    value="${selectedClass.enrolled}" max="${selectedClass.maxStudents}">
                    ${Math.round((selectedClass.enrolled / selectedClass.maxStudents) * 100)}%
                </progress>
            </div>
        </div>
    `;

    // Show the modal
    document.getElementById('classDetailsModal').classList.add('is-active');
}

function closeClassDetailsModal() {
    document.getElementById('classDetailsModal').classList.remove('is-active');
    currentClassId = "";
}

// Add/Edit class modal
function showAddClassModal() {
    // Set modal for adding a new class
    document.getElementById('addEditClassTitle').textContent = 'Add New Class';
    document.getElementById('saveClassBtn').textContent = 'Add Class';

    // Clear form fields
    document.getElementById('className').value = '';
    document.getElementById('classDescription').value = '';
    document.getElementById('classStartDate').value = '';
    document.getElementById('classEndDate').value = '';
    document.getElementById('classSchedule').value = '';
    document.getElementById('classMaxStudents').value = '';
    document.getElementById('classId').value = '';

    // Show the modal
    document.getElementById('addEditClassModal').classList.add('is-active');
}

function editClass(classId) {
    const selectedClass = classes.find(cls => cls.id === classId);

    if (!selectedClass) return;

    // Set modal for editing
    document.getElementById('addEditClassTitle').textContent = 'Edit Class';
    document.getElementById('saveClassBtn').textContent = 'Save Changes';

    // Fill form fields
    document.getElementById('className').value = selectedClass.name;
    document.getElementById('classDescription').value = selectedClass.description;
    document.getElementById('classStartDate').value = selectedClass.startDate;
    document.getElementById('classEndDate').value = selectedClass.endDate;
    document.getElementById('classSchedule').value = selectedClass.schedule;
    document.getElementById('classMaxStudents').value = selectedClass.maxStudents;
    document.getElementById('classId').value = classId;

    // Show the modal
    document.getElementById('addEditClassModal').classList.add('is-active');
}

function showEditClassModal() {
    // Use the currentClassId from the details modal
    if (currentClassId) {
        closeClassDetailsModal();
        editClass(currentClassId);
    }
}

function closeAddEditClassModal() {
    document.getElementById('addEditClassModal').classList.remove('is-active');
}

function saveClass() {
    // Get form values
    const name = document.getElementById('className').value;
    const description = document.getElementById('classDescription').value;
    const startDate = document.getElementById('classStartDate').value;
    const endDate = document.getElementById('classEndDate').value;
    const schedule = document.getElementById('classSchedule').value;
    const maxStudents = document.getElementById('classMaxStudents').value;
    const classId = document.getElementById('classId').value;

    if (!name || !description || !startDate || !endDate || !schedule || !maxStudents) {
        alert('Please fill all fields');
        return;
    }

    // Check if editing or adding
    if (classId) {
        // Editing existing class
        const index = classes.findIndex(cls => cls.id === classId);
        if (index !== -1) {
            // Determine status based on dates
            let status = determineClassStatus(startDate, endDate);

            // Update class
            classes[index] = {
                ...classes[index],
                name,
                description,
                startDate,
                endDate,
                schedule,
                maxStudents: parseInt(maxStudents),
                status
            };

            alert('Class updated successfully!');
        }
    } else {
        // Adding new class
        // Generate a new class ID
        const newId = `CLS${String(classes.length + 1).padStart(3, '0')}`;

        // Determine status based on dates
        let status = determineClassStatus(startDate, endDate);

        // Create new class object
        const newClass = {
            id: newId,
            name,
            description,
            startDate,
            endDate,
            schedule,
            maxStudents: parseInt(maxStudents),
            enrolled: 0,
            status
        };

        // Add to classes array
        classes.push(newClass);

        alert('Class added successfully!');
    }

    // Close the modal
    closeAddEditClassModal();

    // Reload the classes
    loadClasses();
}

function determineClassStatus(startDate, endDate) {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (currentDate < start) {
        return 'upcoming';
    } else if (currentDate > end) {
        return 'completed';
    } else {
        return 'active';
    }
}

function confirmDeleteClass() {
    // Confirm before deleting
    if (confirm(`Are you sure you want to delete this class?`)) {
        deleteClass(currentClassId);
    }
}

function deleteClass(classId) {
    // Remove the class
    classes = classes.filter(cls => cls.id !== classId);

    // Close the modal
    closeClassDetailsModal();

    // Update the UI
    loadClasses();

    alert('Class deleted successfully!');
}

// Student management functions
function openManageStudents(classId) {
    currentClassId = classId;
    const selectedClass = classes.find(cls => cls.id === classId);

    if (!selectedClass) return;

    // Set modal title
    document.getElementById('manageStudentsTitle').textContent = `Manage Students - ${selectedClass.name}`;

    // Load enrolled students
    loadEnrolledStudents(classId);

    // Reset tab to enrolled students
    document.querySelector('[data-tab="enrolled-students"]').click();

    // Show the modal
    document.getElementById('manageStudentsModal').classList.add('is-active');
}

function loadEnrolledStudents(classId) {
    const tableBody = document.getElementById('enrolledStudentsTableBody');
    tableBody.innerHTML = '';

    // Get students enrolled in this class
    const enrolledStudentsList = students.filter(student =>
        student.enrolledClasses.includes(classId)
    );

    if (enrolledStudentsList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="has-text-centered">No students enrolled in this class</td>
            </tr>
        `;
        return;
    }

    enrolledStudentsList.forEach(student => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.contact}</td>
            <td>
                <!-- In a real app, we would get actual attendance data -->
                <span class="tag is-success">85%</span>
            </td>
            <td>
                <div class="buttons are-small">
                    <a href="view_student.html?id=${student.id}" class="button is-info" target="_blank">
                        <span class="icon"><i class="fas fa-eye"></i></span>
                    </a>
                    <button class="button is-danger" onclick="removeStudentFromClass('${student.id}')">
                        <span class="icon"><i class="fas fa-user-minus"></i></span>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function removeStudentFromClass(studentId) {
    if (confirm('Are you sure you want to remove this student from the class?')) {
        // Find the student
        const studentIndex = students.findIndex(student => student.id === studentId);

        if (studentIndex !== -1) {
            // Remove the class from student's enrolled classes
            const classIndex = students[studentIndex].enrolledClasses.indexOf(currentClassId);
            if (classIndex !== -1) {
                students[studentIndex].enrolledClasses.splice(classIndex, 1);

                // Update class enrollment count
                const classIndex2 = classes.findIndex(cls => cls.id === currentClassId);
                if (classIndex2 !== -1) {
                    classes[classIndex2].enrolled--;
                }

                alert('Student removed from class successfully!');

                // Reload the students table
                loadEnrolledStudents(currentClassId);

                // Reload the classes (to update enrollment count)
                loadClasses();
            }
        }
    }
}

function searchStudentsToAdd() {
    const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase();
    loadAvailableStudents(searchTerm);
}

function loadAvailableStudents(searchTerm = '') {
    const tableBody = document.getElementById('availableStudentsTableBody');
    tableBody.innerHTML = '';

    // Get students not enrolled in this class
    let availableStudentsList = students.filter(student =>
        !student.enrolledClasses.includes(currentClassId)
    );

    // Apply search filter if provided
    if (searchTerm) {
        availableStudentsList = availableStudentsList.filter(student =>
            student.id.toLowerCase().includes(searchTerm) ||
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm)
        );
    }

    if (availableStudentsList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="has-text-centered">No students available to add</td>
            </tr>
        `;
        return;
    }

    availableStudentsList.forEach(student => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.contact}</td>
            <td>
                <div class="buttons are-small">
                    <button class="button is-success" onclick="addStudentToClass('${student.id}')">
                        <span class="icon"><i class="fas fa-user-plus"></i></span>
                        <span>Add</span>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function addStudentToClass(studentId) {
    // Find the student
    const studentIndex = students.findIndex(student => student.id === studentId);

    if (studentIndex !== -1) {
        // Find the class
        const classIndex = classes.findIndex(cls => cls.id === currentClassId);

        if (classIndex !== -1) {
            // Check if class is full
            if (classes[classIndex].enrolled >= classes[classIndex].maxStudents) {
                alert('This class is already at maximum capacity.');
                return;
            }

            // Add the class to student's enrolled classes
            students[studentIndex].enrolledClasses.push(currentClassId);

            // Update class enrollment count
            classes[classIndex].enrolled++;

            alert('Student added to class successfully!');

            // Reload both student tables
            loadEnrolledStudents(currentClassId);
            loadAvailableStudents(document.getElementById('studentSearchInput').value.toLowerCase());

            // Reload the classes (to update enrollment count)
            loadClasses();
        }
    }
}

function closeManageStudentsModal() {
    document.getElementById('manageStudentsModal').classList.remove('is-active');
    currentClassId = "";
}
