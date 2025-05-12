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
            
            console.log('Student data loaded from API:', currentStudent);
            
            if (currentStudent.fName !== undefined && currentStudent.fName !== null) {
                currentStudent.firstName = currentStudent.fName;
            } else if (currentStudent.firstName !== undefined && currentStudent.firstName !== null) {
                currentStudent.fName = currentStudent.firstName;
            } else {
                currentStudent.firstName = "Unknown";
                currentStudent.fName = "Unknown";
            }
            
            if (currentStudent.lName !== undefined && currentStudent.lName !== null) {
                currentStudent.lastName = currentStudent.lName;
            } else if (currentStudent.lastName !== undefined && currentStudent.lastName !== null) {
                currentStudent.lName = currentStudent.lastName;
            } else {
                currentStudent.lastName = "User";
                currentStudent.lName = "User";
            }
            
            console.log('Student data normalized with required field names:', 
                'id:', currentStudent.id, 
                'fName:', currentStudent.fName, 
                'lName:', currentStudent.lName,
                'firstName:', currentStudent.firstName,
                'lastName:', currentStudent.lastName);
            
            console.log('Student data normalized:', 
                'id:', currentStudent.id, 
                'fName:', currentStudent.fName, 
                'lName:', currentStudent.lName,
                'firstName:', currentStudent.firstName,
                'lastName:', currentStudent.lastName);
                
            console.log('Student name set to:', currentStudent.firstName, currentStudent.lastName);
            
            loadStudentProfile();
        } catch (studentError) {
            console.error('Error fetching student profile:', studentError);
            showError(`Couldn't load your profile: ${studentError.message}`);
        }

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
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
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
        let profilePicUrl = '../../public/profile-pic.png';
        if (currentStudent.profilePic) {
            const blob = new Blob([new Uint8Array(currentStudent.profilePic)], {type: 'image/png'});
            profilePicUrl = URL.createObjectURL(blob);
        }

        const firstName = currentStudent.fName || currentStudent.firstName || 'Unknown';
        const lastName = currentStudent.lName || currentStudent.lastName || 'User';
        
        document.getElementById('studentName').textContent = `${firstName} ${lastName}`;
        console.log('Setting profile display name to:', firstName, lastName);
        document.getElementById('studentId').textContent = `ID: STU${currentStudent.id.toString().padStart(3, '0')}`;
        document.getElementById('studentAddress').textContent = currentStudent.address || 'N/A';
        document.getElementById('studentNic').textContent = currentStudent.nic || 'N/A';
        document.getElementById('studentContact').textContent = currentStudent.contact || 'N/A';
        document.getElementById('studentProfilePic').src = profilePicUrl;
        
        console.log('Profile displayed with name:', firstName, lastName);
    } catch (error) {
        console.error('Error loading student profile:', error);
        showError('Failed to load profile data');
    }
}

function openEditProfileModal() {
    const modalHTML = `
        <div class="modal is-active" id="editProfileModal">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Edit Profile</p>
                    <button class="delete" aria-label="close" id="closeProfileModalBtn"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">First Name</label>
                        <div class="control">
                            <input class="input" type="text" id="editFirstName" value="${currentStudent.fName || currentStudent.firstName || ''}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Last Name</label>
                        <div class="control">
                            <input class="input" type="text" id="editLastName" value="${currentStudent.lName || currentStudent.lastName || ''}">
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
                        <label class="label">Date of Birth</label>
                        <div class="control">
                            <input class="input" type="date" id="editDob" value="${currentStudent.dob ? currentStudent.dob.substring(0, 10) : ''}">
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
                    <button class="button is-success" id="saveProfileBtn">Save changes</button>
                    <button class="button" id="cancelProfileBtn">Cancel</button>
                </footer>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('closeProfileModalBtn').addEventListener('click', closeEditProfileModal);
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);
    document.getElementById('cancelProfileBtn').addEventListener('click', closeEditProfileModal);
    
    document.querySelector('#editProfileModal .modal-background').addEventListener('click', closeEditProfileModal);

    document.getElementById('profilePicUpload').addEventListener('change', function () {
        const fileName = this.files[0]?.name || 'No file selected';
        document.getElementById('fileName').textContent = fileName;
    });
}

function closeEditProfileModal() {
    console.log('Closing edit profile modal');
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        const closeBtn = document.getElementById('closeProfileModalBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelProfileBtn');
        
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        }
        
        if (saveBtn) {
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        }
        
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        }
        
        modal.remove();
    } else {
        console.warn('Modal not found in DOM');
    }
}

async function saveProfileChanges() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) {
        console.error('Edit profile modal not found');
        return;
    }
    
    const saveButton = document.getElementById('saveProfileBtn');
    if (!saveButton) {
        console.error('Save button not found');
        return;
    }
    
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Saving...</span>';

    try {
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const address = document.getElementById('editAddress').value;
        const contact = document.getElementById('editContact').value;
        const dob = document.getElementById('editDob').value;
        const fileInput = document.getElementById('profilePicUpload');
        
        console.log('Saving profile changes for student ID:', auth.studentId);
        console.log('Form values:', {
            fName: firstName,
            lName: lastName,
            address,
            contact
        });
        
        let hasProfilePicture = fileInput && fileInput.files.length > 0;
        
        if (hasProfilePicture) {
            try {
                console.log('Profile picture detected, using FormData for upload');
                
                const formData = new FormData();
                formData.append('profilePicture', fileInput.files[0]);
                
                const studentData = {
                    id: currentStudent.id,
                    fName: firstName,
                    lName: lastName,
                    address: address,
                    contact: contact,
                    email: currentStudent.email,
                    nic: currentStudent.nic
                };
                
                console.log('Student data for form:', studentData);
                
                formData.append('student', JSON.stringify(studentData));
                                
                console.log('FormData entries:');
                for(let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + (pair[0] === 'profilePic' ? '[File Object]' : pair[1]));
                }
                
                console.log('Sending form data:', formData);
                
                const response = await fetch(`${API_BASE_URL}/student/students`, {
                    method: 'PATCH',
                    body: formData,
                    credentials: 'include'
                });
                
                console.log('Profile update raw response:', response);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server error response:', errorText);
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }
                
                let updatedData;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    updatedData = await response.json();
                } else {
                    updatedData = {
                        id: currentStudent.id,
                        fName: firstName, 
                        lName: lastName,
                        address: address,
                        contact: contact
                    };
                }
                console.log('Profile with image updated successfully:', updatedData);
                
                Object.assign(currentStudent, updatedData);
                
                loadStudentProfile();
                
                closeEditProfileModal();
                showSuccess('Profile updated successfully!');
                
                return;
            } catch (imageError) {
                console.error('Error uploading profile with image:', imageError);
                showError(`Failed to update profile picture: ${imageError.message}`);
                
                saveButton.disabled = false;
                saveButton.textContent = originalText;
                return;
            }
        }
        
        const updatedStudent = {
            id: currentStudent.id,
            address: address || "",
            contact: contact || "",
            fName: firstName || "",
            lName: lastName || "", 
            email: currentStudent.email || "",
            nic: currentStudent.nic || ""
        };
        
        console.log('Updating student without image:', updatedStudent);

        console.log('Updating student with data (no image):', updatedStudent);

        console.log('Using ApiService to update student profile with data:', updatedStudent);
        
        try {
            const response = await ApiService.updateStudent(currentStudent.id, updatedStudent);
            console.log('Profile update response:', response);
            
            if (!response) {
                throw new Error('Failed to update profile - empty response');
            }
            
            if (response && response.id) {
                currentStudent = {
                    ...response,
                    firstName: response.fName || firstName, 
                    lastName: response.lName || lastName,
                    fName: response.fName || firstName,
                    lName: response.lName || lastName
                };
                console.log('Updated student with server response:', currentStudent);
            } else {
                currentStudent = {
                    ...updatedStudent,
                    firstName: firstName,
                    lastName: lastName,
                    fName: firstName,
                    lName: lastName
                };
                console.log('Updated student with local data (no valid server response):', currentStudent);
            }
            
            console.log('Profile updated successfully without image:', currentStudent);
        } catch (apiError) {
            console.error('ApiService error:', apiError);
            throw new Error(`Failed to update profile: ${apiError.message}`);
        }

        try {
            currentStudent = await ApiService.getStudent(currentStudent.id);
            console.log('Fetched updated student data:', currentStudent);
        } catch (fetchError) {
            console.warn('Could not fetch updated student data:', fetchError);
            
            currentStudent.fName = firstName;
            currentStudent.lName = lastName;
            currentStudent.address = address;
            currentStudent.contact = contact;
        }

        loadStudentProfile();

        closeEditProfileModal();

        showSuccess('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        showError(`Failed to update profile: ${error.message || 'Unknown error'}`);

        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = originalText;
        }
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
                    <button class="delete" aria-label="close" id="closeClassDetailsBtn"></button>
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
                    <button class="button" id="closeClassDetailsBtnFooter">Close</button>
                </footer>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('closeClassDetailsBtn').addEventListener('click', closeClassDetailsModal);
    document.getElementById('closeClassDetailsBtnFooter').addEventListener('click', closeClassDetailsModal);
    
    document.querySelector('#classDetailsModal .modal-background').addEventListener('click', closeClassDetailsModal);
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
                    <button class="button is-primary is-small apply-class-btn" data-class-id="${cls.id}">
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
    
    document.querySelectorAll('.apply-class-btn').forEach(button => {
        button.addEventListener('click', function() {
            const classId = this.getAttribute('data-class-id');
            applyForClass(classId);
        });
    });
}

async function applyForClass(classId) {
    console.log('Applying for class with ID:', classId);
    const classToApply = availableClasses.find(cls => cls.id == classId);

    if (!classToApply) {
        console.error('Class not found in available classes list');
        showError('Could not find the selected class. Please refresh and try again.');
        return;
    }

    const existingModal = document.getElementById('applyClassModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div class="modal is-active" id="applyClassModal">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Apply for Class</p>
                    <button class="delete" aria-label="close" id="closeApplyClassModalBtn"></button>
                </header>
                <section class="modal-card-body">
                    <p>Are you sure you want to apply for <strong>${classToApply.name}</strong>?</p>
                    <p><strong>Schedule:</strong> ${classToApply.schedule}</p>
                    <p><strong>Period:</strong> ${new Date(classToApply.startDate).toLocaleDateString()} to ${new Date(classToApply.endDate).toLocaleDateString()}</p>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-primary" id="confirmApplyClassBtn">Confirm</button>
                    <button class="button" id="cancelApplyClassBtn">Cancel</button>
                </footer>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('closeApplyClassModalBtn').onclick = closeApplyClassModal;
    document.getElementById('cancelApplyClassBtn').onclick = closeApplyClassModal;
    document.querySelector('#applyClassModal .modal-background').onclick = closeApplyClassModal;
    
    document.getElementById('confirmApplyClassBtn').onclick = async function() {
        try {
            this.classList.add('is-loading');
            this.disabled = true;
            
            const modal = document.getElementById('applyClassModal');
            
            if (modal) modal.remove();
            
            console.log(`Sending request to join class ${classId} for student ${auth.studentId}`);
            
            const requestData = {
                studentId: parseInt(auth.studentId),
                classId: parseInt(classId)
            };
            
            console.log('Request data:', requestData);
            
            try {
                const response = await ApiService.createClassRequest(requestData);
                console.log('Class request response:', response);
                
                showSuccess('Application sent successfully! Waiting for admin approval.');
                
                await loadAvailableClasses(auth.studentId);
            } catch (apiError) {
                console.error('API error:', apiError);
                showError(`Failed to apply for class: ${apiError.message}`);
            }
        } catch (error) {
            console.error('Error in confirm apply class action:', error);
            showError('An unexpected error occurred. Please try again.');
        }
    };
}

function closeApplyClassModal() {
    console.log('Closing apply class modal');
    const modal = document.getElementById('applyClassModal');
    
    if (modal) {
        console.log('Modal found, removing it from DOM');
        
        modal.remove();
        
        console.log('Modal removed');
    } else {
        console.warn('Apply class modal not found in DOM');
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
        const link = document.createElement('a');
        link.textContent = className;
        link.addEventListener('click', () => filterAttendanceByClass(className));
        li.appendChild(link);
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
        
        window.location.replace('login.html');
    }
}

function initializeGlobalFunctions() {
    window.logout = logout;
    window.openEditProfileModal = openEditProfileModal;
    window.closeEditProfileModal = closeEditProfileModal;
    window.saveProfileChanges = saveProfileChanges;
    window.viewClassDetails = viewClassDetails;
    window.closeClassDetailsModal = closeClassDetailsModal;
    window.applyForClass = applyForClass;
    window.closeApplyClassModal = closeApplyClassModal;
    window.filterAttendanceByClass = filterAttendanceByClass;
}

function initializeEventListeners() {
    console.log('Setting up student dashboard event listeners');
    
    initializeGlobalFunctions();
    
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    } else {
        console.warn('Edit profile button not found in DOM');
    }
    
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
    
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
        console.warn('Logout button not found in DOM');
    }
    
    const availableClassesContainer = document.getElementById('availableClassesContainer');
    if (availableClassesContainer) {
        availableClassesContainer.addEventListener('click', function(event) {
            const target = event.target.closest('.apply-class-btn');
            if (target) {
                const classId = target.getAttribute('data-class-id');
                if (classId) {
                    applyForClass(classId);
                }
            }
        });
    } else {
        console.warn('Available classes container not found in DOM');
    }
}