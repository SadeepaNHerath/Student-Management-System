/**
 * Class Management JavaScript
 * Handles functionality for the class management page including:
 * - Creating, editing, and deleting classes
 * - Viewing class details
 * - Managing students in classes
 */

import ApiService from '../services/api.service.js';
import {API_BASE_URL} from '../utils/constants.js';

let classes = [];
let students = [];

let currentClassId = "";

document.addEventListener('DOMContentLoaded', function () {
    loadClasses();
});

function showLoading(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="has-text-centered p-6">
                <span class="icon is-large">
                    <i class="fas fa-spinner fa-pulse fa-2x"></i>
                </span>
                <p class="mt-3">${message || 'Loading...'}</p>
            </div>
        `;
    }
}

async function loadClasses(filter = 'all') {
    const container = document.getElementById('classesContainer');
    container.innerHTML = '';
    
    try {
        showLoading('classesContainer', 'Loading classes...');
        
        classes = await ApiService.getClasses();
        
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
    } catch (error) {
        console.error('Error loading classes:', error);
        container.innerHTML = `
            <div class="column is-full">
                <div class="notification is-danger is-light">
                    Failed to load classes. Please try again later.
                </div>
            </div>
        `;
    }
}

function filterClasses(status) {
    document.querySelectorAll('.tabs li').forEach(li => li.classList.remove('is-active'));
    document.querySelector(`.tabs li a[onclick="filterClasses('${status}')"]`).parentElement.classList.add('is-active');

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

    filteredClasses.forEach(cls => {
        const classCard = document.createElement('div');
        classCard.className = 'column is-4';

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

function viewClassDetails(classId) {
    currentClassId = classId;
    const selectedClass = classes.find(cls => cls.id === classId);

    if (!selectedClass) return;

    document.getElementById('modalClassTitle').textContent = selectedClass.name;

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

    document.getElementById('classDetailsModal').classList.add('is-active');
}

function closeClassDetailsModal() {
    document.getElementById('classDetailsModal').classList.remove('is-active');
    currentClassId = "";
}

function showAddClassModal() {
    document.getElementById('addEditClassTitle').textContent = 'Add New Class';
    document.getElementById('saveClassBtn').textContent = 'Add Class';

    document.getElementById('className').value = '';
    document.getElementById('classDescription').value = '';
    document.getElementById('classStartDate').value = '';
    document.getElementById('classEndDate').value = '';
    document.getElementById('classSchedule').value = '';
    document.getElementById('classMaxStudents').value = '';
    document.getElementById('classId').value = '';

    document.getElementById('addEditClassModal').classList.add('is-active');
}

function editClass(classId) {
    const selectedClass = classes.find(cls => cls.id === classId);

    if (!selectedClass) return;

    document.getElementById('addEditClassTitle').textContent = 'Edit Class';
    document.getElementById('saveClassBtn').textContent = 'Save Changes';

    document.getElementById('className').value = selectedClass.name;
    document.getElementById('classDescription').value = selectedClass.description;
    document.getElementById('classStartDate').value = selectedClass.startDate;
    document.getElementById('classEndDate').value = selectedClass.endDate;
    document.getElementById('classSchedule').value = selectedClass.schedule;
    document.getElementById('classMaxStudents').value = selectedClass.maxStudents;
    document.getElementById('classId').value = classId;

    document.getElementById('addEditClassModal').classList.add('is-active');
}

function showEditClassModal() {
    if (currentClassId) {
        closeClassDetailsModal();
        editClass(currentClassId);
    }
}

function closeAddEditClassModal() {
    document.getElementById('addEditClassModal').classList.remove('is-active');
}

function saveClass() {
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

    if (classId) {
        const index = classes.findIndex(cls => cls.id === classId);
        if (index !== -1) {
            let status = determineClassStatus(startDate, endDate);

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
        const newId = `CLS${String(classes.length + 1).padStart(3, '0')}`;

        let status = determineClassStatus(startDate, endDate);

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

        classes.push(newClass);

        alert('Class added successfully!');
    }

    closeAddEditClassModal();

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
    if (confirm(`Are you sure you want to delete this class?`)) {
        deleteClass(currentClassId);
    }
}

function deleteClass(classId) {
    classes = classes.filter(cls => cls.id !== classId);

    closeClassDetailsModal();

    loadClasses();

    alert('Class deleted successfully!');
}

function openManageStudents(classId) {
    currentClassId = classId;
    const selectedClass = classes.find(cls => cls.id === classId);

    if (!selectedClass) return;

    document.getElementById('manageStudentsTitle').textContent = `Manage Students - ${selectedClass.name}`;

    loadEnrolledStudents(classId);

    document.querySelector('[data-tab="enrolled-students"]').click();

    document.getElementById('manageStudentsModal').classList.add('is-active');
}

function loadEnrolledStudents(classId) {
    const tableBody = document.getElementById('enrolledStudentsTableBody');
    tableBody.innerHTML = '';

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
        const studentIndex = students.findIndex(student => student.id === studentId);

        if (studentIndex !== -1) {
            const classIndex = students[studentIndex].enrolledClasses.indexOf(currentClassId);
            if (classIndex !== -1) {
                students[studentIndex].enrolledClasses.splice(classIndex, 1);

                const classIndex2 = classes.findIndex(cls => cls.id === currentClassId);
                if (classIndex2 !== -1) {
                    classes[classIndex2].enrolled--;
                }

                alert('Student removed from class successfully!');

                loadEnrolledStudents(currentClassId);

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

    let availableStudentsList = students.filter(student =>
        !student.enrolledClasses.includes(currentClassId)
    );

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
    const studentIndex = students.findIndex(student => student.id === studentId);

    if (studentIndex !== -1) {
        const classIndex = classes.findIndex(cls => cls.id === currentClassId);

        if (classIndex !== -1) {
            if (classes[classIndex].enrolled >= classes[classIndex].maxStudents) {
                alert('This class is already at maximum capacity.');
                return;
            }

            students[studentIndex].enrolledClasses.push(currentClassId);

            classes[classIndex].enrolled++;

            alert('Student added to class successfully!');

            loadEnrolledStudents(currentClassId);
            loadAvailableStudents(document.getElementById('studentSearchInput').value.toLowerCase());

            loadClasses();
        }
    }
}

function closeManageStudentsModal() {
    document.getElementById('manageStudentsModal').classList.remove('is-active');
    currentClassId = "";
}
