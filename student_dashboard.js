/**
 * Student Dashboard JavaScript
 * Handles functionality for the student dashboard including:
 * - Displaying and editing profile information
 * - Viewing enrolled classes
 * - Applying for available classes
 * - Viewing attendance history
 */

// Initialize global variables
let currentStudent = {};
let enrolledClasses = [];
let availableClasses = [];
let attendanceRecords = [];
let classAttendancePercentages = {};

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Make sure user is authenticated as student
    if (!auth.requireStudent()) {
        return; // This will redirect to login if not authenticated
    }
    
    // Load student data based on ID from auth
    await loadStudentData(auth.studentId);
});

// Function to load all student data with the given student ID
async function loadStudentData(studentId) {
    try {
        showLoading('dashboardContent', 'Loading dashboard data...');
          // Fetch student information
        const response = await fetch(`${API_BASE_URL}/student/students/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        currentStudent = await response.json();
        
        // Format some data for display
        currentStudent.firstName = currentStudent.fName;
        currentStudent.lastName = currentStudent.lName;
        
        // Load related data
        await Promise.all([
            loadEnrolledClasses(studentId),
            loadAvailableClasses(studentId),
            loadAttendanceHistory(studentId)
        ]);
        
        // Update the UI with all the data
        loadStudentProfile();
        
        hideLoading('dashboardContent');
    } catch (error) {
        console.error('Error loading student data:', error);
        showError('Error loading dashboard data. Please try again later.'); 
        hideLoading('dashboardContent');
    }
}

// Show loading indicator
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

// Hide loading indicator
function hideLoading(containerId) {
    // Do nothing, content will be replaced by the respective load functions
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification is-danger';
    errorDiv.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    document.querySelector('section.section').prepend(errorDiv);
    
    // Add event listener to close button
    errorDiv.querySelector('.delete').addEventListener('click', () => {
        errorDiv.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Profile functions
async function loadStudentProfile() {
    try {
        // Convert the binary profile picture to a data URL
        let profilePicUrl = 'img src/profile-pic.png'; // Default
        if (currentStudent.profilePic) {
            const blob = new Blob([new Uint8Array(currentStudent.profilePic)], { type: 'image/png' });
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
    
    // Add modal to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add file input handler
    document.getElementById('profilePicUpload').addEventListener('change', function() {
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
    // Show loading state
    const saveButton = document.querySelector('#editProfileModal .button.is-success');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Saving...</span>';
    
    try {
        // Get updated values
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const address = document.getElementById('editAddress').value;
        const contact = document.getElementById('editContact').value;
        const fileInput = document.getElementById('profilePicUpload');
        
        // Create FormData object for multipart/form-data request
        const formData = new FormData();
        
        // Create student object
        const updatedStudent = {
            ...currentStudent,
            fName: firstName,
            lName: lastName,
            address: address,
            contact: contact
        };
        
        // Add JSON data as a blob
        const studentBlob = new Blob([JSON.stringify(updatedStudent)], {
            type: 'application/json'
        });
        formData.append('student', studentBlob);
        
        // Add profile picture if selected
        if (fileInput.files.length > 0) {
            formData.append('profilePicture', fileInput.files[0]);
        } else {
            // Create an empty file to satisfy the API
            const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
            formData.append('profilePicture', emptyBlob, 'empty.txt');
        }
          // Send update request
        const response = await fetch(`${API_BASE_URL}/student/students`, {
            method: 'PATCH',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        // Update the current student object
        currentStudent.firstName = firstName;
        currentStudent.lastName = lastName;
        currentStudent.fName = firstName;
        currentStudent.lName = lastName;
        currentStudent.address = address;
        currentStudent.contact = contact;
        
        // Refresh the UI
        loadStudentProfile();
        
        // Close the modal
        closeEditProfileModal();
        
        // Show success message
        showSuccess('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile. Please try again.');
        
        // Restore button state
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
    
    // Add event listener to close button
    successDiv.querySelector('.delete').addEventListener('click', () => {
        successDiv.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Classes functions
async function loadEnrolledClasses(studentId) {
    try {
        // Fetch enrolled classes
        const response = await fetch(`${API_BASE_URL}/classes/student/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch enrolled classes');
        
        enrolledClasses = await response.json();
        
        // Fetch attendance percentages
        const percentageResponse = await fetch(`${API_BASE_URL}/attendance/student/${studentId}/percentage`);
        if (percentageResponse.ok) {
            classAttendancePercentages = await percentageResponse.json();
        }
        
        // Update UI
        updateEnrolledClassesUI();
    } catch (error) {
        console.error('Error loading enrolled classes:', error);
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
        // Get attendance percentage from our map, default to 0 if not found
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
    
    // Create modal HTML
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
    
    // Add modal to the body
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
        // Fetch available classes (classes the student is not enrolled in)
        const response = await fetch(`${API_BASE_URL}/classes/student/${studentId}/available`);
        if (!response.ok) throw new Error('Failed to fetch available classes');
        
        availableClasses = await response.json();
        
        // Update UI
        updateAvailableClassesUI();
    } catch (error) {
        console.error('Error loading available classes:', error);
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
    // Find the class
    const classToApply = availableClasses.find(cls => cls.id == classId);
    
    if (!classToApply) return;
    
    const confirmMsg = `Apply for ${classToApply.name}? 
    
Schedule: ${classToApply.schedule}
Period: ${new Date(classToApply.startDate).toLocaleDateString()} to ${new Date(classToApply.endDate).toLocaleDateString()}`;
    
    if (confirm(confirmMsg)) {
        try {
            // Send request to the API
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
            
            // Show success message
            showSuccess('Application sent successfully! Waiting for admin approval.');
            
            // Refresh available classes
            await loadAvailableClasses(auth.studentId);
        } catch (error) {
            console.error('Error applying for class:', error);
            showError(error.message || 'Failed to apply for class. Please try again.');
        }
    }
}

// Attendance history functions
async function loadAttendanceHistory(studentId) {
    try {
        // Fetch attendance records
        const response = await fetch(`${API_BASE_URL}/attendance/student/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch attendance records');
        
        attendanceRecords = await response.json();
        
        // Update UI
        updateAttendanceHistoryUI();
    } catch (error) {
        console.error('Error loading attendance history:', error);
        attendanceRecords = [];
        updateAttendanceHistoryUI();
    }
}

function updateAttendanceHistoryUI() {
    // First load the attendance records
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
    
    // Then set up the class tabs for filtering
    const tabsList = document.getElementById('classTabsList');
    if (!tabsList) return;
    
    // Clear existing tabs except the first "All Classes" tab
    while (tabsList.children.length > 1) {
        tabsList.removeChild(tabsList.lastChild);
    }
    
    // Ensure "All Classes" tab is active
    if (tabsList.firstChild) {
        tabsList.firstChild.classList.add('is-active');
    }
    
    // Get unique class names from records
    const classNames = [...new Set(attendanceRecords.map(record => record.classAttended.name))];
    
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
        updateAttendanceHistoryUI();
    } else {
        // Find the tab by content and set it active
        document.querySelectorAll('#classTabsList li a').forEach(a => {
            if (a.textContent === className) {
                a.parentElement.classList.add('is-active');
            }
        });
        
        // Filter records by class
        const filteredRecords = attendanceRecords.filter(record => record.classAttended.name === className);
        
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
        // Clear authentication data
        auth.clearAuth();
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}