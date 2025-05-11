/**
 * Admin Dashboard JavaScript
 * Handles functionality for the admin dashboard including:
 * - Loading and managing students
 * - Creating and managing classes
 * - Taking attendance
 * - Processing student requests for classes
 */

let students = [];
let classes = [];
let requests = [];
let attendanceData = {};
let activeClass = null;

document.addEventListener('DOMContentLoaded', async function () {
    if (!auth.requireAdmin()) {
        return;
    }

    await Promise.all([
        loadStudents(),
        loadClasses(),
        loadRequests()
    ]);

    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement) {
        adminNameElement.textContent = `Admin (ID: ${auth.userId})`;
    }

    const tabs = document.querySelectorAll('.tabs li');
    if (tabs) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const target = this.dataset.target;

                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });

                document.querySelectorAll('.tabs li').forEach(tab => {
                    tab.classList.remove('is-active');
                });

                document.getElementById(target).style.display = 'block';

                this.classList.add('is-active');
            });
        });
    }

    setupSearchListeners();
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

async function loadStudents() {
    try {
        showLoading('studentsTableContainer', 'Loading students data...');
        const response = await fetch(`${API_BASE_URL}/student/students`);
        if (!response.ok) {
            throw new Error('Failed to load students');
        }

        students = await response.json();

        updateStudentsTable();

        hideLoading('studentsTableContainer');
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students data');
        hideLoading('studentsTableContainer');
    }
}

// Update the students table with current data
function updateStudentsTable() {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="has-text-centered">No students found</td>
            </tr>
        `;
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>STU${student.id.toString().padStart(3, '0')}</td>
            <td>${student.fName} ${student.lName}</td>
            <td>${student.contact || 'N/A'}</td>
            <td>
                <div class="buttons is-centered">
                    <button class="button is-small is-info" onclick="viewStudentDetails(${student.id})">
                        <span class="icon is-small">
                            <i class="fas fa-info-circle"></i>
                        </span>
                    </button>
                    <button class="button is-small is-primary" onclick="editStudent(${student.id})">
                        <span class="icon is-small">
                            <i class="fas fa-edit"></i>
                        </span>
                    </button>
                    <button class="button is-small is-danger" onclick="deleteStudent(${student.id})">
                        <span class="icon is-small">
                            <i class="fas fa-trash-alt"></i>
                        </span>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// View student details
async function viewStudentDetails(studentId) {
    try {
        // Fetch student details from API
        const response = await fetch(`${API_BASE_URL}/student/students/${studentId}`);
        if (!response.ok) {
            throw new Error('Failed to load student details');
        }

        const student = await response.json();

        // Fetch student's classes
        const classesResponse = await fetch(`${API_BASE_URL}/classes/student/${studentId}`);
        let studentClasses = [];

        if (classesResponse.ok) {
            studentClasses = await classesResponse.json();
        }

        // Convert the binary profile picture to a data URL if available
        let profilePicUrl = 'img src/profile-pic.png'; // Default
        if (student.profilePic) {
            try {
                const blob = new Blob([new Uint8Array(student.profilePic)], { type: 'image/png' });
                profilePicUrl = URL.createObjectURL(blob);
            } catch (e) {
                console.error('Error processing profile pic:', e);
            }
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal is-active" id="studentDetailsModal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Student Details</p>
                        <button class="delete" aria-label="close" onclick="closeModal('studentDetailsModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="columns">
                            <div class="column is-4">
                                <figure class="image is-128x128 is-flex is-justify-content-center is-align-items-center mx-auto mb-4">
                                    <img src="${profilePicUrl}" class="is-rounded" alt="Profile picture">
                                </figure>
                            </div>
                            <div class="column is-8">
                                <div class="content">
                                    <h3 class="title is-4">${student.fName} ${student.lName}</h3>
                                    <p><strong>ID:</strong> STU${student.id.toString().padStart(3, '0')}</p>
                                    <p><strong>NIC:</strong> ${student.nic || 'N/A'}</p>
                                    <p><strong>Contact:</strong> ${student.contact || 'N/A'}</p>
                                    <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
                                    <p><strong>Date of Birth:</strong> ${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-5">
                            <h4 class="title is-5">Enrolled Classes</h4>
                            <table class="table is-fullwidth">
                                <thead>
                                    <tr>
                                        <th>Class ID</th>
                                        <th>Class Name</th>
                                        <th>Schedule</th>
                                    </tr>
                                </thead>
                                <tbody id="studentClassesTableBody">
                                    ${studentClasses.length > 0 ?
                studentClasses.map(cls => `
                                            <tr>
                                                <td>${cls.id}</td>
                                                <td>${cls.name}</td>
                                                <td>${cls.schedule || 'N/A'}</td>
                                            </tr>
                                        `).join('') :
                '<tr><td colspan="3" class="has-text-centered">Not enrolled in any classes</td></tr>'
            }
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button" onclick="closeModal('studentDetailsModal')">Close</button>
                    </footer>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error viewing student details:', error);
        showError('Failed to load student details');
    }
}

// Close any modal by ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Edit student details
async function editStudent(studentId) {
    try {
        // Fetch student details from API
        const response = await fetch(`${API_BASE_URL}/student/students/${studentId}`);
        if (!response.ok) {
            throw new Error('Failed to load student details');
        }

        const student = await response.json();

        // Convert the binary profile picture to a data URL if available
        let profilePicUrl = 'img src/profile-pic.png'; // Default
        if (student.profilePic) {
            try {
                const blob = new Blob([new Uint8Array(student.profilePic)], { type: 'image/png' });
                profilePicUrl = URL.createObjectURL(blob);
            } catch (e) {
                console.error('Error processing profile pic:', e);
            }
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal is-active" id="editStudentModal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Edit Student</p>
                        <button class="delete" aria-label="close" onclick="closeModal('editStudentModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="columns">
                            <div class="column is-4">
                                <figure class="image is-128x128 mx-auto mb-4">
                                    <img src="${profilePicUrl}" id="studentProfilePreview" class="is-rounded" alt="Profile picture">
                                </figure>
                                <div class="file has-name is-boxed is-centered">
                                    <label class="file-label">
                                        <input class="file-input" type="file" id="studentProfilePic" accept="image/*">
                                        <span class="file-cta">
                                            <span class="file-icon">
                                                <i class="fas fa-upload"></i>
                                            </span>
                                            <span class="file-label">
                                                Change photo
                                            </span>
                                        </span>
                                        <span class="file-name" id="fileName">
                                            No file selected
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div class="column is-8">
                                <div class="field">
                                    <label class="label">First Name</label>
                                    <div class="control">
                                        <input class="input" type="text" id="editFirstName" value="${student.fName}">
                                    </div>
                                </div>
                                <div class="field">
                                    <label class="label">Last Name</label>
                                    <div class="control">
                                        <input class="input" type="text" id="editLastName" value="${student.lName}">
                                    </div>
                                </div>
                                <div class="field">
                                    <label class="label">NIC</label>
                                    <div class="control">
                                        <input class="input" type="text" id="editNic" value="${student.nic || ''}">
                                    </div>
                                </div>
                                <div class="field">
                                    <label class="label">Contact</label>
                                    <div class="control">
                                        <input class="input" type="text" id="editContact" value="${student.contact || ''}">
                                    </div>
                                </div>
                                <div class="field">
                                    <label class="label">Address</label>
                                    <div class="control">
                                        <input class="input" type="text" id="editAddress" value="${student.address || ''}">
                                    </div>
                                </div>
                                <div class="field">
                                    <label class="label">Date of Birth</label>
                                    <div class="control">
                                        <input class="input" type="date" id="editDob" value="${student.dob ? student.dob.substring(0, 10) : ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="saveStudentChanges(${student.id})">Save changes</button>
                        <button class="button" onclick="closeModal('editStudentModal')">Cancel</button>
                    </footer>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add file input event listener
        document.getElementById('studentProfilePic').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('studentProfilePreview').src = e.target.result;
                    document.getElementById('fileName').textContent = file.name;
                }
                reader.readAsDataURL(file);
            }
        });
    } catch (error) {
        console.error('Error editing student:', error);
        showError('Failed to load student details for editing');
    }
}

// Save student changes
async function saveStudentChanges(studentId) {
    // Show loading state
    const saveButton = document.querySelector('#editStudentModal .button.is-success');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Saving...</span>';

    try {
        // Get form values
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const nic = document.getElementById('editNic').value;
        const contact = document.getElementById('editContact').value;
        const address = document.getElementById('editAddress').value;
        const dob = document.getElementById('editDob').value;
        const profilePicInput = document.getElementById('studentProfilePic');

        // Create FormData object for multipart/form-data request
        const formData = new FormData();

        // Create student object
        const updatedStudent = {
            id: studentId,
            fName: firstName,
            lName: lastName,
            nic: nic,
            contact: contact,
            address: address,
            dob: dob
        };

        // Add JSON data as a blob
        const studentBlob = new Blob([JSON.stringify(updatedStudent)], {
            type: 'application/json'
        });
        formData.append('student', studentBlob);

        // Add profile picture if selected
        if (profilePicInput.files.length > 0) {
            formData.append('profilePicture', profilePicInput.files[0]);
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
            throw new Error('Failed to update student');
        }

        // Refresh students list
        await loadStudents();

        // Close modal
        closeModal('editStudentModal');

        // Show success message
        showSuccess('Student updated successfully!');
    } catch (error) {
        console.error('Error updating student:', error);
        showError('Failed to update student details');

        // Restore button state
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    }
}

// Delete student
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        deleteStudentFromAPI(studentId);
    }
}

// Delete student from API
async function deleteStudentFromAPI(studentId) {
    try {
        // Send delete request
        const response = await fetch(`${API_BASE_URL}/student/students/${studentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete student');
        }

        // Refresh students list
        await loadStudents();

        // Show success message
        showSuccess('Student deleted successfully!');
    } catch (error) {
        console.error('Error deleting student:', error);
        showError('Failed to delete student');
    }
}

// Show form to add a new student
function showAddStudentForm() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal is-active" id="addStudentModal">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Add New Student</p>
                    <button class="delete" aria-label="close" onclick="closeModal('addStudentModal')"></button>
                </header>
                <section class="modal-card-body">
                    <div class="columns">
                        <div class="column is-4">
                            <figure class="image is-128x128 mx-auto mb-4">
                                <img src="img src/profile-pic.png" id="newStudentProfilePreview" class="is-rounded" alt="Profile picture">
                            </figure>
                            <div class="file has-name is-boxed is-centered">
                                <label class="file-label">
                                    <input class="file-input" type="file" id="newStudentProfilePic" accept="image/*">
                                    <span class="file-cta">
                                        <span class="file-icon">
                                            <i class="fas fa-upload"></i>
                                        </span>
                                        <span class="file-label">
                                            Choose a photo
                                        </span>
                                    </span>
                                    <span class="file-name" id="newFileName">
                                        No file selected
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div class="column is-8">
                            <div class="field">
                                <label class="label">First Name</label>
                                <div class="control">
                                    <input class="input" type="text" id="newFirstName" placeholder="First Name">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Last Name</label>
                                <div class="control">
                                    <input class="input" type="text" id="newLastName" placeholder="Last Name">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">NIC</label>
                                <div class="control">
                                    <input class="input" type="text" id="newNic" placeholder="NIC Number">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Contact</label>
                                <div class="control">
                                    <input class="input" type="text" id="newContact" placeholder="Phone Number">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Address</label>
                                <div class="control">
                                    <input class="input" type="text" id="newAddress" placeholder="Address">
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Date of Birth</label>
                                <div class="control">
                                    <input class="input" type="date" id="newDob">
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" onclick="addStudent()">Add Student</button>
                    <button class="button" onclick="closeModal('addStudentModal')">Cancel</button>
                </footer>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add file input event listener
    document.getElementById('newStudentProfilePic').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('newStudentProfilePreview').src = e.target.result;
                document.getElementById('newFileName').textContent = file.name;
            }
            reader.readAsDataURL(file);
        }
    });
}

// Add a new student
async function addStudent() {
    // Show loading state
    const addButton = document.querySelector('#addStudentModal .button.is-success');
    const originalText = addButton.textContent;
    addButton.disabled = true;
    addButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Adding...</span>';

    try {
        // Get form values
        const firstName = document.getElementById('newFirstName').value;
        const lastName = document.getElementById('newLastName').value;
        const nic = document.getElementById('newNic').value;
        const contact = document.getElementById('newContact').value;
        const address = document.getElementById('newAddress').value;
        const dob = document.getElementById('newDob').value;
        const profilePicInput = document.getElementById('newStudentProfilePic');

        // Validation
        if (!firstName || !lastName) {
            throw new Error('First name and last name are required');
        }

        // Create FormData object for multipart/form-data request
        const formData = new FormData();

        // Create student object
        const newStudent = {
            fName: firstName,
            lName: lastName,
            nic: nic,
            contact: contact,
            address: address,
            dob: dob
        };

        // Add JSON data as a blob
        const studentBlob = new Blob([JSON.stringify(newStudent)], {
            type: 'application/json'
        });
        formData.append('student', studentBlob);

        // Add profile picture if selected
        if (profilePicInput.files.length > 0) {
            formData.append('profilePicture', profilePicInput.files[0]);
        } else {
            // Create an empty file to satisfy the API
            const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
            formData.append('profilePicture', emptyBlob, 'empty.txt');
        }

        // Send create request
        const response = await fetch(`${API_BASE_URL}/student/students`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to add student');
        }

        // Refresh students list
        await loadStudents();

        // Close modal
        closeModal('addStudentModal');

        // Show success message
        showSuccess('Student added successfully!');
    } catch (error) {
        console.error('Error adding student:', error);
        showError(error.message || 'Failed to add student');

        // Restore button state
        addButton.disabled = false;
        addButton.textContent = originalText;
    }
}

// ============= CLASSES MANAGEMENT =============

// Load classes from API
async function loadClasses() {
    try {
        showLoading('classesTableContainer', 'Loading classes data...');

        // Fetch classes from API
        const response = await fetch(`${API_BASE_URL}/classes`);
        if (!response.ok) {
            throw new Error('Failed to load classes');
        }

        classes = await response.json();

        // Update the UI
        updateClassesTable();

        hideLoading('classesTableContainer');
    } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes data');
        hideLoading('classesTableContainer');
    }
}

// Update the classes table with current data
function updateClassesTable() {
    const tableBody = document.getElementById('classesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (classes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="has-text-centered">No classes found</td>
            </tr>
        `;
        return;
    }

    classes.forEach(cls => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${cls.id}</td>
            <td>${cls.name}</td>
            <td>${cls.schedule || 'N/A'}</td>
            <td>${cls.startDate ? new Date(cls.startDate).toLocaleDateString() : 'N/A'}</td>
            <td>${cls.endDate ? new Date(cls.endDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <div class="buttons is-centered">
                    <button class="button is-small is-info" onclick="viewClassDetails(${cls.id})">
                        <span class="icon is-small">
                            <i class="fas fa-info-circle"></i>
                        </span>
                    </button>
                    <button class="button is-small is-primary" onclick="editClass(${cls.id})">
                        <span class="icon is-small">
                            <i class="fas fa-edit"></i>
                        </span>
                    </button>
                    <button class="button is-small is-danger" onclick="deleteClass(${cls.id})">
                        <span class="icon is-small">
                            <i class="fas fa-trash-alt"></i>
                        </span>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Add event listener for add class button if it exists
document.addEventListener('DOMContentLoaded', function () {
    const addClassBtn = document.getElementById('addClassBtn');
    if (addClassBtn) {
        addClassBtn.addEventListener('click', showAddClassForm);
    }
});

// Add a new class
async function addClass() {
    // Show loading state
    const addButton = document.querySelector('#addClassModal .button.is-success');
    const originalText = addButton.textContent;
    addButton.disabled = true;
    addButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Adding...</span>';

    try {
        // Get form values
        const className = document.getElementById('newClassName').value;
        const description = document.getElementById('newClassDescription').value;
        const schedule = document.getElementById('newClassSchedule').value;
        const startDate = document.getElementById('newClassStartDate').value;
        const endDate = document.getElementById('newClassEndDate').value;
        const maxStudents = document.getElementById('newClassMaxStudents').value;

        // Validation
        if (!className) {
            throw new Error('Class name is required');
        }

        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        if (new Date(endDate) <= new Date(startDate)) {
            throw new Error('End date must be after start date');
        }

        // Create class object
        const newClass = {
            name: className,
            description: description,
            schedule: schedule,
            startDate: startDate,
            endDate: endDate,
            maxStudents: maxStudents ? parseInt(maxStudents) : null
        };

        // Send create request
        const response = await fetch(`${API_BASE_URL}/classes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newClass)
        });

        if (!response.ok) {
            throw new Error('Failed to add class');
        }

        // Refresh classes list
        await loadClasses();

        // Close modal
        closeModal('addClassModal');

        // Show success message
        showSuccess('Class added successfully!');
    } catch (error) {
        console.error('Error adding class:', error);
        showError(error.message || 'Failed to add class');

        // Restore button state
        addButton.disabled = false;
        addButton.textContent = originalText;
    }
}

// Show form to add a new class
function showAddClassForm() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal is-active" id="addClassModal">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Add New Class</p>
                    <button class="delete" aria-label="close" onclick="closeModal('addClassModal')"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">Class Name</label>
                        <div class="control">
                            <input class="input" type="text" id="newClassName" placeholder="Class Name">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Description</label>
                        <div class="control">
                            <textarea class="textarea" id="newClassDescription" placeholder="Class Description"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Schedule</label>
                        <div class="control">
                            <input class="input" type="text" id="newClassSchedule" placeholder="e.g. Mon, Wed 10:00-12:00">
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div class="field">
                                <label class="label">Start Date</label>
                                <div class="control">
                                    <input class="input" type="date" id="newClassStartDate">
                                </div>
                            </div>
                        </div>
                        <div class="column">
                            <div class="field">
                                <label class="label">End Date</label>
                                <div class="control">
                                    <input class="input" type="date" id="newClassEndDate">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Maximum Students</label>
                        <div class="control">
                            <input class="input" type="number" id="newClassMaxStudents" placeholder="Leave empty for no limit">
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" onclick="addClass()">Add Class</button>
                    <button class="button" onclick="closeModal('addClassModal')">Cancel</button>
                </footer>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// View class details
async function viewClassDetails(classId) {
    try {
        // Find the class
        const classObj = classes.find(c => c.id == classId);
        if (!classObj) return;

        // Fetch students enrolled in this class
        const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`);
        let enrolledStudents = [];

        if (response.ok) {
            enrolledStudents = await response.json();
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal is-active" id="classDetailsModal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">${classObj.name}</p>
                        <button class="delete" aria-label="close" onclick="closeModal('classDetailsModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="content">
                            <p><strong>Description:</strong> ${classObj.description || 'No description available'}</p>
                            <p><strong>Schedule:</strong> ${classObj.schedule || 'N/A'}</p>
                            <p><strong>Period:</strong> ${new Date(classObj.startDate).toLocaleDateString()} to ${new Date(classObj.endDate).toLocaleDateString()}</p>
                            <p><strong>Maximum Students:</strong> ${classObj.maxStudents || 'No limit'}</p>
                            <p><strong>Enrolled:</strong> ${enrolledStudents.length} student(s)</p>
                        </div>
                        
                        <div class="mt-4">
                            <h4 class="title is-5">Enrolled Students</h4>
                            <table class="table is-fullwidth">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Contact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${enrolledStudents.length > 0 ?
                enrolledStudents.map(student => `
                                            <tr>
                                                <td>STU${student.id.toString().padStart(3, '0')}</td>
                                                <td>${student.fName} ${student.lName}</td>
                                                <td>${student.contact || 'N/A'}</td>
                                            </tr>
                                        `).join('') :
                '<tr><td colspan="3" class="has-text-centered">No students enrolled</td></tr>'
            }
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button" onclick="closeModal('classDetailsModal')">Close</button>
                    </footer>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error viewing class details:', error);
        showError('Failed to load class details');
    }
}

// Edit class
async function editClass(classId) {
    try {
        // Find the class
        const classObj = classes.find(c => c.id == classId);
        if (!classObj) return;

        // Create modal HTML
        const modalHTML = `
            <div class="modal is-active" id="editClassModal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Edit Class</p>
                        <button class="delete" aria-label="close" onclick="closeModal('editClassModal')"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="field">
                            <label class="label">Class Name</label>
                            <div class="control">
                                <input class="input" type="text" id="editClassName" value="${classObj.name}">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Description</label>
                            <div class="control">
                                <textarea class="textarea" id="editClassDescription">${classObj.description || ''}</textarea>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Schedule</label>
                            <div class="control">
                                <input class="input" type="text" id="editClassSchedule" value="${classObj.schedule || ''}">
                            </div>
                        </div>
                        <div class="columns">
                            <div class="column">
                                <div class="field">
                                    <label class="label">Start Date</label>
                                    <div class="control">
                                        <input class="input" type="date" id="editClassStartDate" value="${classObj.startDate ? classObj.startDate.substring(0, 10) : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="field">
                                    <label class="label">End Date</label>
                                    <div class="control">
                                        <input class="input" type="date" id="editClassEndDate" value="${classObj.endDate ? classObj.endDate.substring(0, 10) : ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Maximum Students</label>
                            <div class="control">
                                <input class="input" type="number" id="editClassMaxStudents" value="${classObj.maxStudents || ''}" placeholder="Leave empty for no limit">
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-success" onclick="saveClassChanges(${classObj.id})">Save changes</button>
                        <button class="button" onclick="closeModal('editClassModal')">Cancel</button>
                    </footer>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('Error editing class:', error);
        showError('Failed to load class details for editing');
    }
}

// Save class changes
async function saveClassChanges(classId) {
    // Show loading state
    const saveButton = document.querySelector('#editClassModal .button.is-success');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Saving...</span>';

    try {
        // Get form values
        const className = document.getElementById('editClassName').value;
        const description = document.getElementById('editClassDescription').value;
        const schedule = document.getElementById('editClassSchedule').value;
        const startDate = document.getElementById('editClassStartDate').value;
        const endDate = document.getElementById('editClassEndDate').value;
        const maxStudents = document.getElementById('editClassMaxStudents').value;

        // Validation
        if (!className) {
            throw new Error('Class name is required');
        }

        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        if (new Date(endDate) <= new Date(startDate)) {
            throw new Error('End date must be after start date');
        }

        // Create class object
        const updatedClass = {
            id: classId,
            name: className,
            description: description,
            schedule: schedule,
            startDate: startDate,
            endDate: endDate,
            maxStudents: maxStudents ? parseInt(maxStudents) : null
        };

        // Send update request
        const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedClass)
        });

        if (!response.ok) {
            throw new Error('Failed to update class');
        }

        // Refresh classes list
        await loadClasses();

        // Close modal
        closeModal('editClassModal');

        // Show success message
        showSuccess('Class updated successfully!');
    } catch (error) {
        console.error('Error updating class:', error);
        showError(error.message || 'Failed to update class');

        // Restore button state
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    }
}

// Delete class
function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
        deleteClassFromAPI(classId);
    }
}

// Delete class from API
async function deleteClassFromAPI(classId) {
    try {
        // Send delete request
        const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete class');
        }

        // Refresh classes list
        await loadClasses();

        // Show success message
        showSuccess('Class deleted successfully!');
    } catch (error) {
        console.error('Error deleting class:', error);
        showError('Failed to delete class');
    }
}

// ============= REQUESTS MANAGEMENT =============

// Load class requests from API
async function loadRequests() {
    try {
        showLoading('requestsTableContainer', 'Loading requests data...');

        // Fetch requests from API
        const response = await fetch(`${API_BASE_URL}/requests`);
        if (!response.ok) {
            throw new Error('Failed to load requests');
        }

        requests = await response.json();

        // Update the UI
        updateRequestsTable();

        hideLoading('requestsTableContainer');
    } catch (error) {
        console.error('Error loading requests:', error);
        showError('Failed to load requests data');
        hideLoading('requestsTableContainer');
    }
}

// Update the requests table with current data
function updateRequestsTable() {
    const tableBody = document.getElementById('requestsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="has-text-centered">No pending requests</td>
            </tr>
        `;
        return;
    }

    requests.forEach(request => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>STU${request.student.id.toString().padStart(3, '0')}</td>
            <td>${request.student.fName} ${request.student.lName}</td>
            <td>${request.requestedClass.name}</td>
            <td>${new Date(request.requestDate).toLocaleDateString()}</td>
            <td>
                <span class="tag ${request.status === 'PENDING' ? 'is-warning' :
                request.status === 'APPROVED' ? 'is-success' :
                    'is-danger'
            }">
                    ${request.status}
                </span>
            </td>
            <td>
                <div class="buttons is-centered">
                    ${request.status === 'PENDING' ? `
                        <button class="button is-small is-success" onclick="approveRequest(${request.id})">
                            <span class="icon is-small">
                                <i class="fas fa-check"></i>
                            </span>
                        </button>
                        <button class="button is-small is-danger" onclick="rejectRequest(${request.id})">
                            <span class="icon is-small">
                                <i class="fas fa-times"></i>
                            </span>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Approve class request
async function approveRequest(requestId) {
    try {
        // Send approval request
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/approve`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Failed to approve request');
        }

        // Refresh requests list
        await loadRequests();

        // Show success message
        showSuccess('Request approved successfully!');
    } catch (error) {
        console.error('Error approving request:', error);
        showError('Failed to approve request');
    }
}

// Reject class request
async function rejectRequest(requestId) {
    // Prompt for rejection reason
    const reason = prompt('Enter reason for rejection:');

    if (reason !== null) { // Only proceed if the user didn't cancel
        try {
            // Send rejection request
            const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    responseNotes: reason
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reject request');
            }

            // Refresh requests list
            await loadRequests();

            // Show success message
            showSuccess('Request rejected successfully!');
        } catch (error) {
            console.error('Error rejecting request:', error);
            showError('Failed to reject request');
        }
    }
}

// ============= ATTENDANCE MANAGEMENT =============

// Load attendance data for a specific class
async function loadAttendanceForClass(classId) {
    try {
        // Set active class
        activeClass = classes.find(c => c.id == classId);
        if (!activeClass) return;

        showLoading('attendanceContent', `Loading attendance for ${activeClass.name}...`);

        // Fetch students enrolled in this class
        const studentResponse = await fetch(`${API_BASE_URL}/classes/${classId}/students`);
        if (!studentResponse.ok) {
            throw new Error('Failed to load students for this class');
        }

        const students = await studentResponse.json();

        // Get today's date in the format YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);

        // Fetch attendance for today if exists
        const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/class/${classId}/date/${today}`);
        let todayAttendance = [];

        if (attendanceResponse.ok) {
            todayAttendance = await attendanceResponse.json();
        }

        // Update attendanceData object
        attendanceData = {
            classId: classId,
            date: today,
            students: students,
            attendance: todayAttendance
        };

        // Update UI
        updateAttendanceUI();

        hideLoading('attendanceContent');
    } catch (error) {
        console.error('Error loading attendance:', error);
        showError('Failed to load attendance data');
        hideLoading('attendanceContent');
    }
}

// Update the attendance UI
function updateAttendanceUI() {
    const container = document.getElementById('attendanceContent');
    if (!container) return;

    if (!activeClass || !attendanceData.students) {
        container.innerHTML = `
            <div class="message is-info">
                <div class="message-body has-text-centered">
                    Please select a class to take attendance
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h3 class="title is-4">${activeClass.name} - Attendance</h3>
        <div class="field">
            <label class="label">Date</label>
            <div class="control">
                <input class="input" type="date" id="attendanceDate" value="${attendanceData.date}">
            </div>
        </div>
        <div class="box">
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Attendance</th>
                    </tr>
                </thead>
                <tbody id="attendanceTableBody">
                    ${attendanceData.students.map(student => {
        const attendanceRecord = attendanceData.attendance.find(a =>
            a.student && a.student.id === student.id
        );
        const isPresent = attendanceRecord ? attendanceRecord.present : false;

        return `
                            <tr>
                                <td>STU${student.id.toString().padStart(3, '0')}</td>
                                <td>${student.fName} ${student.lName}</td>
                                <td>
                                    <div class="field">
                                        <div class="control">
                                            <label class="checkbox">
                                                <input type="checkbox" class="attendance-checkbox" 
                                                    data-student-id="${student.id}" 
                                                    ${isPresent ? 'checked' : ''}>
                                                Present
                                            </label>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
            <div class="field is-grouped is-grouped-right mt-4">
                <div class="control">
                    <button class="button is-primary" onclick="saveAttendance()">
                        <span class="icon">
                            <i class="fas fa-save"></i>
                        </span>
                        <span>Save Attendance</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listener for date change
    document.getElementById('attendanceDate').addEventListener('change', function (e) {
        loadAttendanceForDate(activeClass.id, e.target.value);
    });
}

// Load attendance for a specific date
async function loadAttendanceForDate(classId, date) {
    try {
        // Update the date in attendanceData
        attendanceData.date = date;

        // Fetch attendance for the selected date
        const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/class/${classId}/date/${date}`);
        let dateAttendance = [];

        if (attendanceResponse.ok) {
            dateAttendance = await attendanceResponse.json();
        }

        // Update attendanceData
        attendanceData.attendance = dateAttendance;

        // Update checkboxes based on loaded attendance
        const checkboxes = document.querySelectorAll('.attendance-checkbox');
        checkboxes.forEach(checkbox => {
            const studentId = parseInt(checkbox.dataset.studentId);
            const attendanceRecord = dateAttendance.find(a =>
                a.student && a.student.id === studentId
            );
            checkbox.checked = attendanceRecord ? attendanceRecord.present : false;
        });
    } catch (error) {
        console.error('Error loading attendance for date:', error);
        showError('Failed to load attendance data for the selected date');
    }
}

// Save attendance data
async function saveAttendance() {
    try {
        // Show loading indicator
        const saveButton = document.querySelector('#attendanceContent .button.is-primary');
        const originalText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Saving...</span>';

        // Collect attendance data from checkboxes
        const attendanceRecords = [];
        const checkboxes = document.querySelectorAll('.attendance-checkbox');

        checkboxes.forEach(checkbox => {
            attendanceRecords.push({
                studentId: parseInt(checkbox.dataset.studentId),
                classId: activeClass.id,
                date: document.getElementById('attendanceDate').value,
                present: checkbox.checked
            });
        });

        // Send attendance data to API
        const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendanceRecords)
        });

        if (!response.ok) {
            throw new Error('Failed to save attendance');
        }

        // Show success message
        showSuccess('Attendance saved successfully!');

        // Reload attendance data
        await loadAttendanceForDate(activeClass.id, document.getElementById('attendanceDate').value);

        // Restore button state
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
    } catch (error) {
        console.error('Error saving attendance:', error);
        showError('Failed to save attendance data');

        // Restore button state
        const saveButton = document.querySelector('#attendanceContent .button.is-primary');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<span class="icon"><i class="fas fa-save"></i></span><span>Save Attendance</span>';
        }
    }
}

// ============= SEARCH FUNCTIONALITY =============

// Setup event listeners for search inputs
function setupSearchListeners() {
    // Student search
    const studentSearchInput = document.getElementById('studentSearch');
    if (studentSearchInput) {
        studentSearchInput.addEventListener('keyup', function () {
            const searchTerm = this.value.toLowerCase();
            filterStudents(searchTerm);
        });
    }

    // Class search
    const classSearchInput = document.getElementById('classSearch');
    if (classSearchInput) {
        classSearchInput.addEventListener('keyup', function () {
            const searchTerm = this.value.toLowerCase();
            filterClasses(searchTerm);
        });
    }

    // Request search
    const requestSearchInput = document.getElementById('requestSearch');
    if (requestSearchInput) {
        requestSearchInput.addEventListener('keyup', function () {
            const searchTerm = this.value.toLowerCase();
            filterRequests(searchTerm);
        });
    }
}

// Filter students based on search
function filterStudents(searchTerm) {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');

    if (rows.length === 0) return;

    rows.forEach(row => {
        const idCell = row.cells[0]?.textContent?.toLowerCase() || '';
        const nameCell = row.cells[1]?.textContent?.toLowerCase() || '';
        const contactCell = row.cells[2]?.textContent?.toLowerCase() || '';

        if (idCell.includes(searchTerm) || nameCell.includes(searchTerm) || contactCell.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter classes based on search
function filterClasses(searchTerm) {
    const tableBody = document.getElementById('classesTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');

    if (rows.length === 0) return;

    rows.forEach(row => {
        const idCell = row.cells[0]?.textContent?.toLowerCase() || '';
        const nameCell = row.cells[1]?.textContent?.toLowerCase() || '';
        const scheduleCell = row.cells[2]?.textContent?.toLowerCase() || '';

        if (idCell.includes(searchTerm) || nameCell.includes(searchTerm) || scheduleCell.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter requests based on search
function filterRequests(searchTerm) {
    const tableBody = document.getElementById('requestsTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');

    if (rows.length === 0) return;

    rows.forEach(row => {
        const idCell = row.cells[0]?.textContent?.toLowerCase() || '';
        const nameCell = row.cells[1]?.textContent?.toLowerCase() || '';
        const classCell = row.cells[2]?.textContent?.toLowerCase() || '';
        const dateCell = row.cells[3]?.textContent?.toLowerCase() || '';

        if (idCell.includes(searchTerm) || nameCell.includes(searchTerm) ||
            classCell.includes(searchTerm) || dateCell.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ============= INITIALIZATION =============

// Check active tab on page load and show content accordingly
document.addEventListener('DOMContentLoaded', function () {
    const activeTab = document.querySelector('.tabs li.is-active');
    if (activeTab) {
        const target = activeTab.dataset.target;

        // Show the active tab content
        const activeContent = document.getElementById(target);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }
});

// Logout
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear authentication data
        auth.clearAuth();

        // Redirect to login page
        window.location.href = 'index.html';
    }
}
