/**
 * Request Management JavaScript
 * Handles functionality for the class request management page including:
 * - Displaying and filtering class join requests
 * - Approving and rejecting requests
 * - Bulk actions on multiple requests
 */

// Mock data for demonstration
let classes = [
    {id: "CLS001", name: "Web Development"},
    {id: "CLS002", name: "Java Programming"},
    {id: "CLS003", name: "Database Design"},
    {id: "CLS004", name: "Mobile App Development"},
    {id: "CLS005", name: "Python for Data Science"}
];

let students = [
    {id: "STU001", firstName: "John", lastName: "Doe"},
    {id: "STU002", firstName: "Jane", lastName: "Smith"},
    {id: "STU003", firstName: "Robert", lastName: "Johnson"},
    {id: "STU004", firstName: "Emily", lastName: "Brown"},
    {id: "STU005", firstName: "Michael", lastName: "Davis"},
    {id: "STU006", firstName: "Sarah", lastName: "Wilson"}
];

let requests = [
    {
        id: "REQ001",
        studentId: "STU001",
        classId: "CLS003",
        date: "2025-05-08",
        status: "pending",
        message: "I'm interested in learning database design to complement my web development skills.",
        feedback: ""
    },
    {
        id: "REQ002",
        studentId: "STU002",
        classId: "CLS003",
        date: "2025-05-07",
        status: "approved",
        message: "I want to join this class to improve my database knowledge.",
        feedback: "Approved! Looking forward to having you in the class."
    },
    {
        id: "REQ003",
        studentId: "STU003",
        classId: "CLS002",
        date: "2025-05-06",
        status: "rejected",
        message: "I need to learn Java to advance in my career.",
        feedback: "Sorry, the class is currently full. Please try again for the next session."
    },
    {
        id: "REQ004",
        studentId: "STU004",
        classId: "CLS004",
        date: "2025-05-05",
        status: "pending",
        message: "I'm interested in mobile development and would like to join this class.",
        feedback: ""
    },
    {
        id: "REQ005",
        studentId: "STU005",
        classId: "CLS001",
        date: "2025-05-04",
        status: "pending",
        message: "I need to learn web development for my project.",
        feedback: ""
    },
    {
        id: "REQ006",
        studentId: "STU006",
        classId: "CLS005",
        date: "2025-05-03",
        status: "approved",
        message: "I want to learn Python for data science to advance my career.",
        feedback: "Welcome to the class! We're excited to have you."
    }
];

let selectedRequests = [];

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Populate class dropdown
    populateClassDropdown();

    // Load requests with default filter (pending)
    filterRequests();
});

// Populate class dropdown
function populateClassDropdown() {
    const classFilter = document.getElementById('classFilter');

    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classFilter.appendChild(option);
    });
}

// Filter requests based on selected filters
function filterRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const classFilter = document.getElementById('classFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Reset selected requests
    selectedRequests = [];
    document.getElementById('selectAllCheckbox').checked = false;
    updateBulkActionControls();

    // Apply filters
    let filteredRequests = requests;

    if (statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
    }

    if (classFilter) {
        filteredRequests = filteredRequests.filter(req => req.classId === classFilter);
    }

    if (searchTerm) {
        filteredRequests = filteredRequests.filter(req => {
            const student = students.find(s => s.id === req.studentId);
            if (!student) return false;

            const studentFullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            return studentFullName.includes(searchTerm) || req.studentId.toLowerCase().includes(searchTerm);
        });
    }

    // Update the request count
    document.getElementById('requestCount').textContent = filteredRequests.length;

    // Display requests or show no results message
    if (filteredRequests.length === 0) {
        document.getElementById('noRequestsMessage').style.display = 'block';
    } else {
        document.getElementById('noRequestsMessage').style.display = 'none';
    }

    // Populate the table
    populateRequestsTable(filteredRequests);
}

// Populate requests table
function populateRequestsTable(filteredRequests) {
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';

    if (filteredRequests.length === 0) {
        return;
    }

    filteredRequests.forEach(request => {
        const row = document.createElement('tr');

        // Get student name from ID
        const student = students.find(s => s.id === request.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : request.studentId;

        // Get class name from ID
        const classObj = classes.find(c => c.id === request.classId);
        const className = classObj ? classObj.name : request.classId;

        // Create status badge based on status
        let statusBadge = '';
        if (request.status === 'pending') {
            statusBadge = '<span class="tag is-warning">Pending</span>';
        } else if (request.status === 'approved') {
            statusBadge = '<span class="tag is-success">Approved</span>';
        } else if (request.status === 'rejected') {
            statusBadge = '<span class="tag is-danger">Rejected</span>';
        }

        row.innerHTML = `
            <td>
                <label class="checkbox">
                    <input type="checkbox" class="request-checkbox" value="${request.id}" 
                        ${request.status === 'pending' ? '' : 'disabled'} 
                        onchange="updateSelectedRequests(this)">
                </label>
            </td>
            <td>${request.id}</td>
            <td>${studentName} <small>(${request.studentId})</small></td>
            <td>${className}</td>
            <td>${formatDate(request.date)}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="buttons are-small">
                    <button class="button is-info" onclick="viewRequestDetails('${request.id}')">
                        <span class="icon"><i class="fas fa-eye"></i></span>
                    </button>
                    
                    ${request.status === 'pending' ? `
                        <button class="button is-success" onclick="approveRequest('${request.id}')">
                            <span class="icon"><i class="fas fa-check"></i></span>
                        </button>
                        <button class="button is-danger" onclick="rejectRequest('${request.id}')">
                            <span class="icon"><i class="fas fa-times"></i></span>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Format date for display
function formatDate(dateString) {
    const options = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Toggle select all checkboxes
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.request-checkbox:not([disabled])');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;

        if (selectAllCheckbox.checked && !selectedRequests.includes(checkbox.value)) {
            selectedRequests.push(checkbox.value);
        } else if (!selectAllCheckbox.checked) {
            selectedRequests = selectedRequests.filter(id => id !== checkbox.value);
        }
    });

    updateBulkActionControls();
}

// Update selected requests array when checkbox changes
function updateSelectedRequests(checkbox) {
    if (checkbox.checked && !selectedRequests.includes(checkbox.value)) {
        selectedRequests.push(checkbox.value);
    } else if (!checkbox.checked) {
        selectedRequests = selectedRequests.filter(id => id !== checkbox.value);
    }

    updateBulkActionControls();
}

// Update bulk action controls visibility
function updateBulkActionControls() {
    const bulkActionControls = document.getElementById('bulkActionControls');
    const selectedCount = document.getElementById('selectedCount');

    if (selectedRequests.length > 0) {
        bulkActionControls.style.display = 'flex';
        selectedCount.textContent = selectedRequests.length;
    } else {
        bulkActionControls.style.display = 'none';
    }
}

// View request details
function viewRequestDetails(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Get student name from ID
    const student = students.find(s => s.id === request.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : request.studentId;

    // Get class name from ID
    const classObj = classes.find(c => c.id === request.classId);
    const className = classObj ? classObj.name : request.classId;

    // Create status badge based on status
    let statusBadge = '';
    if (request.status === 'pending') {
        statusBadge = '<span class="tag is-warning">Pending</span>';
    } else if (request.status === 'approved') {
        statusBadge = '<span class="tag is-success">Approved</span>';
    } else if (request.status === 'rejected') {
        statusBadge = '<span class="tag is-danger">Rejected</span>';
    }

    // Fill modal content
    const content = document.getElementById('requestDetailsContent');
    content.innerHTML = `
        <div class="block">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <p class="title is-4">Request ${request.id}</p>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        ${statusBadge}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="block">
            <div class="columns">
                <div class="column is-6">
                    <h5 class="title is-5">Student Information</h5>
                    <p><strong>ID:</strong> ${request.studentId}</p>
                    <p><strong>Name:</strong> ${studentName}</p>
                </div>
                <div class="column is-6">
                    <h5 class="title is-5">Class Information</h5>
                    <p><strong>ID:</strong> ${request.classId}</p>
                    <p><strong>Name:</strong> ${className}</p>
                </div>
            </div>
        </div>
        
        <div class="block">
            <h5 class="title is-5">Request Details</h5>
            <p><strong>Date:</strong> ${formatDate(request.date)}</p>
            <p><strong>Status:</strong> ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</p>
            
            <div class="message is-info mt-3">
                <div class="message-header">
                    <p>Student's Message</p>
                </div>
                <div class="message-body">
                    ${request.message || 'No message provided.'}
                </div>
            </div>
            
            ${request.feedback ? `
                <div class="message is-${request.status === 'approved' ? 'success' : 'danger'} mt-3">
                    <div class="message-header">
                        <p>Admin Feedback</p>
                    </div>
                    <div class="message-body">
                        ${request.feedback}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Setup action buttons
    const actionButtons = document.getElementById('requestActionButtons');

    if (request.status === 'pending') {
        actionButtons.innerHTML = `
            <button class="button is-success mr-2" onclick="approveRequestWithFeedback('${request.id}')">
                <span class="icon">
                    <i class="fas fa-check"></i>
                </span>
                <span>Approve</span>
            </button>
            <button class="button is-danger mr-2" onclick="rejectRequestWithFeedback('${request.id}')">
                <span class="icon">
                    <i class="fas fa-times"></i>
                </span>
                <span>Reject</span>
            </button>
        `;
    } else {
        actionButtons.innerHTML = '';
    }

    // Show modal
    document.getElementById('requestDetailsModal').classList.add('is-active');
}

// Close request details modal
function closeRequestDetailsModal() {
    document.getElementById('requestDetailsModal').classList.remove('is-active');
}

// Approve request
function approveRequest(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    request.status = 'approved';
    request.feedback = "Request approved.";

    // Refresh the table
    filterRequests();

    alert(`Request ${requestId} has been approved.`);
}

// Reject request
function rejectRequest(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    request.status = 'rejected';
    request.feedback = "Request rejected.";

    // Refresh the table
    filterRequests();

    alert(`Request ${requestId} has been rejected.`);
}

// Approve with feedback
function approveRequestWithFeedback(requestId) {
    // Close the details modal
    closeRequestDetailsModal();

    // Open the feedback modal
    document.getElementById('feedbackModalTitle').textContent = 'Approve Request';
    document.getElementById('feedbackMessage').value = "Approved! Welcome to the class.";
    document.getElementById('feedbackRequestId').value = requestId;
    document.getElementById('feedbackAction').value = 'approve';
    document.getElementById('submitFeedbackBtn').classList.remove('is-danger');
    document.getElementById('submitFeedbackBtn').classList.add('is-success');
    document.getElementById('submitFeedbackBtn').textContent = 'Approve';

    document.getElementById('addFeedbackModal').classList.add('is-active');
}

// Reject with feedback
function rejectRequestWithFeedback(requestId) {
    // Close the details modal
    closeRequestDetailsModal();

    // Open the feedback modal
    document.getElementById('feedbackModalTitle').textContent = 'Reject Request';
    document.getElementById('feedbackMessage').value = "We're sorry, but your request has been rejected.";
    document.getElementById('feedbackRequestId').value = requestId;
    document.getElementById('feedbackAction').value = 'reject';
    document.getElementById('submitFeedbackBtn').classList.remove('is-success');
    document.getElementById('submitFeedbackBtn').classList.add('is-danger');
    document.getElementById('submitFeedbackBtn').textContent = 'Reject';

    document.getElementById('addFeedbackModal').classList.add('is-active');
}

// Close feedback modal
function closeFeedbackModal() {
    document.getElementById('addFeedbackModal').classList.remove('is-active');
}

// Submit feedback
function submitFeedback() {
    const requestId = document.getElementById('feedbackRequestId').value;
    const action = document.getElementById('feedbackAction').value;
    const feedback = document.getElementById('feedbackMessage').value;

    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status and feedback
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.feedback = feedback;

    // Close modal
    closeFeedbackModal();

    // Refresh the table
    filterRequests();

    alert(`Request ${requestId} has been ${action === 'approve' ? 'approved' : 'rejected'}.`);
}

// Approve all pending requests
function approveAllPending() {
    if (confirm('Are you sure you want to approve all pending requests?')) {
        let count = 0;

        requests.forEach(request => {
            if (request.status === 'pending') {
                request.status = 'approved';
                request.feedback = 'Bulk approved.';
                count++;
            }
        });

        // Refresh the table
        filterRequests();

        alert(`${count} pending requests have been approved.`);
    }
}

// Bulk approve selected requests
function bulkApprove() {
    if (selectedRequests.length === 0) {
        alert('No requests selected.');
        return;
    }

    if (confirm(`Are you sure you want to approve ${selectedRequests.length} selected requests?`)) {
        selectedRequests.forEach(requestId => {
            const request = requests.find(r => r.id === requestId);
            if (request && request.status === 'pending') {
                request.status = 'approved';
                request.feedback = 'Bulk approved.';
            }
        });

        // Reset selected requests
        selectedRequests = [];

        // Refresh the table
        filterRequests();

        alert('Selected requests have been approved.');
    }
}

// Bulk reject selected requests
function bulkReject() {
    if (selectedRequests.length === 0) {
        alert('No requests selected.');
        return;
    }

    if (confirm(`Are you sure you want to reject ${selectedRequests.length} selected requests?`)) {
        selectedRequests.forEach(requestId => {
            const request = requests.find(r => r.id === requestId);
            if (request && request.status === 'pending') {
                request.status = 'rejected';
                request.feedback = 'Bulk rejected.';
            }
        });

        // Reset selected requests
        selectedRequests = [];

        // Refresh the table
        filterRequests();

        alert('Selected requests have been rejected.');
    }
}
