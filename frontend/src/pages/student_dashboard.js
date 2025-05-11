/**
 * Student Dashboard JavaScript
 * Handles functionality for the student dashboard including:
 * - Displaying and editing profile information
 * - Viewing enrolled classes
 * - Applying for available classes
 * - Viewing attendance history
 */

import ApiService from '../services/api.service.js';
import {API_BASE_URL} from '../utils/constants.js';

let currentStudent = {};
let enrolledClasses = [];
let availableClasses = [];
let attendanceRecords = [];
let classAttendancePercentages = {};

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Initializing student dashboard...');
    
    if (!auth.requireStudent()) {
        console.warn('Authentication check failed. Redirecting to login page.');
        return;
    }

    // Initialize event listeners
    initializeEventListeners();
    
    try {
        await loadStudentData(auth.studentId);
        console.log('Student dashboard loaded successfully');
    } catch (error) {
        console.error('Failed to load student dashboard:', error);
        showError('Error loading your dashboard data. Please try refreshing the page.');
    }
});

async function loadStudentData(studentId) {
    try {
        showLoading('dashboardContent', 'Loading dashboard data...');
        console.log(`Fetching student data for ID: ${studentId}`);
        
        try {
            currentStudent = await ApiService.getStudent(studentId);
            
            if (!currentStudent) {
                throw new Error('Failed to fetch student data - empty response');
            }
            
            console.log('Student data loaded:', currentStudent);
            
            // Normalize student data field names
            currentStudent.firstName = currentStudent.fName;
            currentStudent.lastName = currentStudent.lName;
            
            loadStudentProfile();
        } catch (studentError) {
            console.error('Error fetching student profile:', studentError);
            showError(`Couldn't load your profile: ${studentError.message}`);
        }

        // Load other data in parallel (continue even if one fails)
        try {
            await Promise.allSettled([
                loadEnrolledClasses(studentId),
                loadAvailableClasses(studentId),
                loadAttendanceHistory(studentId)
            ]);
            console.log('All student data loaded');
        } catch (dataError) {
            console.error('Error loading additional student data:', dataError);
        }

        hideLoading('dashboardContent');
    } catch (error) {
        console.error('Error loading student dashboard:', error);
        showError('Error loading dashboard data. Please try again later.');
        hideLoading('dashboardContent');
    }
}

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

function hideLoading(containerId) {
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification is-danger';
    errorDiv.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;

    document.querySelector('section.section').prepend(errorDiv);

    errorDiv.querySelector('.delete').addEventListener('click', () => {
        errorDiv.remove();
    });

    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

async function loadStudentProfile() {
    try {
        // Convert the binary profile picture to a data URL
        let profilePicUrl = '../../public/profile-pic.png'; // Default
        if (currentStudent.profilePic) {
            const blob = new Blob([new Uint8Array(currentStudent.profilePic)], {type: 'image/png'});
            profilePicUrl = URL.createObjectURL(blob);
        }

        document.getElementById('studentName').textContent = `${currentStudent.firstName} ${currentStudent.lastName}`;
        document.getElementById('studentId').textContent = `ID: STU${currentStudent.id.toString().padStart(3, '0')}`;
        document.getElementById('studentAddress').textContent = currentStudent.address || 'N/A';
        document.getElementById('studentNic').textContent = currentStudent.nic || 'N/A';
        document.getElementById('studentContact').textContent = currentStudent.contact || 'N/A';
        document.getElementById('studentProfilePic').src = profilePicUrl;
    } catch (error) {
        console.error('Error loading student profile:', error);
        showError('Failed to load profile data');
    }
}

// Event listeners are now initialized in the initializeEventListeners function

function openEditProfileModal() {
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
                            <input class="input" type="text" id="editAddress" value="${currentStudent.address || ''}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Contact</label>
                        <div class="control">
                            <input class="input" type="tel" id="editContact" value="${currentStudent.contact || ''}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Profile Picture</label>
                        <div class="file has-name is-fullwidth">
                            <label class="file-label">
                                <input class="file-input" type="file" id="profilePicUpload" accept="image/*">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <i class="fas fa-upload"></i>
                                    </span>
                                    <span class="file-label">Choose a file</span>
                                </span>
                                <span class="file-name" id="fileName">No file selected</span>
                            </label>
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

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('profilePicUpload').addEventListener('change', function () {
        const fileName = this.files[0]?.name || 'No file selected';
        document.getElementById('fileName').textContent = fileName;
    });
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.remove();
    }
}

async function saveProfileChanges() {
    const saveButton = document.querySelector('#editProfileModal .button.is-success');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Saving...</span>';

    try {
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const address = document.getElementById('editAddress').value;
        const contact = document.getElementById('editContact').value;
        const fileInput = document.getElementById('profilePicUpload');

        const formData = new FormData();

        const updatedStudent = {
            ...currentStudent,
            fName: firstName,
            lName: lastName,
            address: address,
            contact: contact
        };

        const studentBlob = new Blob([JSON.stringify(updatedStudent)], {
            type: 'application/json'
        });
        formData.append('student', studentBlob);

        if (fileInput.files.length > 0) {
            formData.append('profilePicture', fileInput.files[0]);
        } else {
            const emptyBlob = new Blob([''], {type: 'application/octet-stream'});
            formData.append('profilePicture', emptyBlob, 'empty.txt');
        }
        const response = await fetch(`${API_BASE_URL}/student/students`, {
            method: 'PATCH',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        currentStudent.firstName = firstName;
        currentStudent.lastName = lastName;
        currentStudent.fName = firstName;
        currentStudent.lName = lastName;
        currentStudent.address = address;
        currentStudent.contact = contact;

        loadStudentProfile();

        closeEditProfileModal();

        showSuccess('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile. Please try again.');

        saveButton.disabled = false;
        saveButton.textContent = originalText;
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'notification is-success';
    successDiv.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;

    document.querySelector('section.section').prepend(successDiv);

    successDiv.querySelector('.delete').addEventListener('click', () => {
        successDiv.remove();
    });

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

async function loadEnrolledClasses(studentId) {
    try {
        console.log(`Loading enrolled classes for student ${studentId}`);
        const response = await fetch(`${API_BASE_URL}/classes/student/${studentId}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch enrolled classes: ${response.status}`);
        }

        enrolledClasses = await response.json();
        console.log(`Found ${enrolledClasses.length} enrolled classes`);
        
        // Get attendance percentages
        try {
            const percentageResponse = await fetch(`${API_BASE_URL}/attendance/student/${studentId}/percentage`);
            if (percentageResponse.ok) {
                classAttendancePercentages = await percentageResponse.json();
                console.log('Loaded attendance percentages:', classAttendancePercentages);
            } else {
                console.warn(`Could not load attendance percentages: ${percentageResponse.status}`);
                classAttendancePercentages = {};
            }
        } catch (percentageError) {
            console.error('Error loading attendance percentages:', percentageError);
            classAttendancePercentages = {};
        }

        updateEnrolledClassesUI();
    } catch (error) {
        console.error('Error loading enrolled classes:', error);
        showError(`Failed to load your classes: ${error.message}`);
        enrolledClasses = [];
        updateEnrolledClassesUI();
    }
}

function updateEnrolledClassesUI() {
    const tableBody = document.getElementById('classesTableBody');
    if (!tableBody) return;

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
        const attendancePercentage = classAttendancePercentages[cls.id] || 0;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${cls.name}</td>
            <td>${cls.schedule}</td>
            <td>
                <progress class="progress ${attendancePercentage >= 80 ? 'is-success' : attendancePercentage >= 60 ? 'is-warning' : 'is-danger'}" 
                    value="${attendancePercentage}" max="100">
                    ${attendancePercentage}%
                </progress>
                <p class="has-text-centered">${attendancePercentage.toFixed(1)}%</p>
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
    const classObj = enrolledClasses.find(c => c.id == classId);
    if (!classObj) return;

    const modalHTML = `
        <div class="modal is-active" id="classDetailsModal">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">${classObj.name}</p>
                    <button class="delete" aria-label="close" onclick="closeClassDetailsModal()"></button>
                </header>
                <section class="modal-card-body">
                    <div class="content">
                        <p><strong>Description:</strong> ${classObj.description || 'No description available'}</p>
                        <p><strong>Schedule:</strong> ${classObj.schedule}</p>
                        <p><strong>Start Date:</strong> ${new Date(classObj.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> ${new Date(classObj.endDate).toLocaleDateString()}</p>
                        <p><strong>Attendance:</strong> ${(classAttendancePercentages[classObj.id] || 0).toFixed(1)}%</p>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" onclick="closeClassDetailsModal()">Close</button>
                </footer>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeClassDetailsModal() {
    const modal = document.getElementById('classDetailsModal');
    if (modal) {
        modal.remove();
    }
}

async function loadAvailableClasses(studentId) {
    try {
        console.log(`Loading available classes for student ${studentId}`);
        const response = await fetch(`${API_BASE_URL}/classes/student/${studentId}/available`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch available classes: ${response.status}`);
        }

        availableClasses = await response.json();
        console.log(`Found ${availableClasses.length} available classes`);

        updateAvailableClassesUI();
    } catch (error) {
        console.error('Error loading available classes:', error);
        showError(`Failed to load available classes: ${error.message}`);
        availableClasses = [];
        updateAvailableClassesUI();
    }
}

function updateAvailableClassesUI() {
    const container = document.getElementById('availableClassesContainer');
    if (!container) return;

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
                <p>${cls.description || 'No description available'}</p>
                <p><strong>Schedule:</strong> ${cls.schedule}</p>
                <p><strong>Period:</strong> ${new Date(cls.startDate).toLocaleDateString()} to ${new Date(cls.endDate).toLocaleDateString()}</p>
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

async function applyForClass(classId) {
    const classToApply = availableClasses.find(cls => cls.id == classId);

    if (!classToApply) return;

    const confirmMsg = `Apply for ${classToApply.name}? 
    
Schedule: ${classToApply.schedule}
Period: ${new Date(classToApply.startDate).toLocaleDateString()} to ${new Date(classToApply.endDate).toLocaleDateString()}`;

    if (confirm(confirmMsg)) {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: auth.studentId,
                    classId: classId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to apply for class');
            }

            showSuccess('Application sent successfully! Waiting for admin approval.');

            await loadAvailableClasses(auth.studentId);
        } catch (error) {
            console.error('Error applying for class:', error);
            showError(error.message || 'Failed to apply for class. Please try again.');
        }
    }
}

async function loadAttendanceHistory(studentId) {
    try {
        console.log(`Loading attendance history for student ${studentId}`);
        const response = await fetch(`${API_BASE_URL}/attendance/student/${studentId}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch attendance records: ${response.status}`);
        }

        attendanceRecords = await response.json();
        console.log(`Found ${attendanceRecords.length} attendance records`);

        updateAttendanceHistoryUI();
    } catch (error) {
        console.error('Error loading attendance history:', error);
        showError(`Failed to load attendance history: ${error.message}`);
        attendanceRecords = [];
        updateAttendanceHistoryUI();
    }
}

function updateAttendanceHistoryUI() {
    const tableBody = document.getElementById('attendanceTableBody');
    if (!tableBody) return;

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
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.classAttended.name}</td>
            <td>
                <span class="tag ${record.present ? 'is-success' : 'is-danger'}">
                    ${record.present ? 'Present' : 'Absent'}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });

    const tabsList = document.getElementById('classTabsList');
    if (!tabsList) return;

    while (tabsList.children.length > 1) {
        tabsList.removeChild(tabsList.lastChild);
    }

    if (tabsList.firstChild) {
        tabsList.firstChild.classList.add('is-active');
    }

    const classNames = [...new Set(attendanceRecords.map(record => record.classAttended.name))];

    classNames.forEach(className => {
        const li = document.createElement('li');
        li.innerHTML = `<a onclick="filterAttendanceByClass('${className}')">${className}</a>`;
        tabsList.appendChild(li);
    });
}

function filterAttendanceByClass(className) {
    document.querySelectorAll('#classTabsList li').forEach(li => {
        li.classList.remove('is-active');
    });

    if (className === 'all') {
        document.querySelector('#classTabsList li:first-child').classList.add('is-active');

        updateAttendanceHistoryUI();
    } else {
        document.querySelectorAll('#classTabsList li a').forEach(a => {
            if (a.textContent === className) {
                a.parentElement.classList.add('is-active');
            }
        });

        const filteredRecords = attendanceRecords.filter(record => record.classAttended.name === className);

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
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.classAttended.name}</td>
                <td>
                    <span class="tag ${record.present ? 'is-success' : 'is-danger'}">
                        ${record.present ? 'Present' : 'Absent'}
                    </span>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        auth.clearAuth();
        
        // Use window.location.replace to prevent back button from coming back to dashboard
        window.location.replace('login.html');
    }
}

// Expose functions to window for HTML access
window.logout = logout;

function initializeEventListeners() {
    console.log('Setting up student dashboard event listeners');
    
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    } else {
        console.warn('Edit profile button not found in DOM');
    }
    
    // Navbar burger menu for mobile
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if (navbarBurgers.length > 0) {
        navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                
                el.classList.toggle('is-active');
                if ($target) {
                    $target.classList.toggle('is-active');
                }
            });
        });
    }
}