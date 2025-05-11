/**
 * Request Management JavaScript
 * Handles functionality for the class request management page including:
 * - Displaying and filtering class join requests
 * - Approving and rejecting requests
 * - Bulk actions on multiple requests
 */

import ApiService from '../services/api.service.js';
import {API_BASE_URL} from '../utils/constants.js';

let classes = [];
let students = [];
let requests = [];
let selectedRequests = [];

document.addEventListener('DOMContentLoaded', function () {
    loadClasses();
    loadStudents();
    loadRequests();
});

async function loadClasses() {
    try {
        classes = await ApiService.getClasses();
        
        if (!classes) {
            throw new Error('Failed to load classes');
        }
        
        populateClassDropdown();
    } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes data. Please try again later.');
    }
}

async function loadStudents() {
    try {
        students = await ApiService.getStudents();
        
        if (!students) {
            throw new Error('Failed to load students');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students data. Please try again later.');
    }
}

async function loadRequests() {
    try {
        requests = await ApiService.getRequests();
        
        if (!requests) {
            throw new Error('Failed to load requests');
        }
        
        filterRequests();
    } catch (error) {
        console.error('Error loading requests:', error);
        showError('Failed to load requests data. Please try again later.');
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

function populateClassDropdown() {
    const classFilter = document.getElementById('classFilter');

    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classFilter.appendChild(option);
    });
}

function filterRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const classFilter = document.getElementById('classFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    selectedRequests = [];
    document.getElementById('selectAllCheckbox').checked = false;
    updateBulkActionControls();

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

    document.getElementById('requestCount').textContent = filteredRequests.length;

    if (filteredRequests.length === 0) {
        document.getElementById('noRequestsMessage').style.display = 'block';
    } else {
        document.getElementById('noRequestsMessage').style.display = 'none';
    }

    populateRequestsTable(filteredRequests);
}

function populateRequestsTable(filteredRequests) {
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';

    if (filteredRequests.length === 0) {
        return;
    }

    filteredRequests.forEach(request => {
        const row = document.createElement('tr');

        const student = students.find(s => s.id === request.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : request.studentId;

        const classObj = classes.find(c => c.id === request.classId);
        const className = classObj ? classObj.name : request.classId;

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

function formatDate(dateString) {
    const options = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
}

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

function updateSelectedRequests(checkbox) {
    if (checkbox.checked && !selectedRequests.includes(checkbox.value)) {
        selectedRequests.push(checkbox.value);
    } else if (!checkbox.checked) {
        selectedRequests = selectedRequests.filter(id => id !== checkbox.value);
    }

    updateBulkActionControls();
}

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

function viewRequestDetails(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const student = students.find(s => s.id === request.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : request.studentId;

    const classObj = classes.find(c => c.id === request.classId);
    const className = classObj ? classObj.name : request.classId;

    let statusBadge = '';
    if (request.status === 'pending') {
        statusBadge = '<span class="tag is-warning">Pending</span>';
    } else if (request.status === 'approved') {
        statusBadge = '<span class="tag is-success">Approved</span>';
    } else if (request.status === 'rejected') {
        statusBadge = '<span class="tag is-danger">Rejected</span>';
    }

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

    document.getElementById('requestDetailsModal').classList.add('is-active');
}

function closeRequestDetailsModal() {
    document.getElementById('requestDetailsModal').classList.remove('is-active');
}

async function approveRequest(requestId) {
    try {
        await ApiService.approveRequest(requestId);
        
        const request = requests.find(r => r.id === requestId);
        if (request) {
            request.status = 'approved';
            request.feedback = "Request approved.";
        }

        filterRequests();
        
        alert(`Request ${requestId} has been approved.`);
    } catch (error) {
        console.error('Error approving request:', error);
        showError('Failed to approve request. Please try again later.');
    }
}

async function rejectRequest(requestId) {
    try {
        await ApiService.rejectRequest(requestId);
        
        // Update local data
        const request = requests.find(r => r.id === requestId);
        if (request) {
            request.status = 'rejected';
            request.feedback = "Request rejected.";
        }

        filterRequests();
        
        alert(`Request ${requestId} has been rejected.`);
    } catch (error) {
        console.error('Error rejecting request:', error);
        showError('Failed to reject request. Please try again later.');
    }
}

function approveRequestWithFeedback(requestId) {
    closeRequestDetailsModal();

    document.getElementById('feedbackModalTitle').textContent = 'Approve Request';
    document.getElementById('feedbackMessage').value = "Approved! Welcome to the class.";
    document.getElementById('feedbackRequestId').value = requestId;
    document.getElementById('feedbackAction').value = 'approve';
    document.getElementById('submitFeedbackBtn').classList.remove('is-danger');
    document.getElementById('submitFeedbackBtn').classList.add('is-success');
    document.getElementById('submitFeedbackBtn').textContent = 'Approve';

    document.getElementById('addFeedbackModal').classList.add('is-active');
}

function rejectRequestWithFeedback(requestId) {
    closeRequestDetailsModal();

    document.getElementById('feedbackModalTitle').textContent = 'Reject Request';
    document.getElementById('feedbackMessage').value = "We're sorry, but your request has been rejected.";
    document.getElementById('feedbackRequestId').value = requestId;
    document.getElementById('feedbackAction').value = 'reject';
    document.getElementById('submitFeedbackBtn').classList.remove('is-success');
    document.getElementById('submitFeedbackBtn').classList.add('is-danger');
    document.getElementById('submitFeedbackBtn').textContent = 'Reject';

    document.getElementById('addFeedbackModal').classList.add('is-active');
}

function closeFeedbackModal() {
    document.getElementById('addFeedbackModal').classList.remove('is-active');
}

function submitFeedback() {
    const requestId = document.getElementById('feedbackRequestId').value;
    const action = document.getElementById('feedbackAction').value;
    const feedback = document.getElementById('feedbackMessage').value;

    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.feedback = feedback;

    closeFeedbackModal();

    filterRequests();

    alert(`Request ${requestId} has been ${action === 'approve' ? 'approved' : 'rejected'}.`);
}

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

        filterRequests();

        alert(`${count} pending requests have been approved.`);
    }
}

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

        selectedRequests = [];

        filterRequests();

        alert('Selected requests have been approved.');
    }
}

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

        selectedRequests = [];

        filterRequests();

        alert('Selected requests have been rejected.');
    }
}
