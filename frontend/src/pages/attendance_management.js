/**
 * Attendance Management JavaScript
 * Handles functionality for the attendance management page including:
 * - Saving attendance records
 * - Viewing attendance history
 */

import ApiService from '../services/api.service.js';
import {API_BASE_URL} from '../utils/constants.js';

let classes = [];
let students = [];

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

async function loadClasses() {
    try {
        classes = await ApiService.getClasses();
        
        if (!classes) {
            throw new Error('Failed to load classes');
        }
        
        populateClassDropdowns();
    } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes data. Please try again later.');
    }
}

async function loadStudents(classId) {
    try {
        const response = await fetch(`${API_BASE_URL}/student/students/class/${classId}`);
        if (!response.ok) {
            throw new Error('Failed to load students');
        }
        
        students = await response.json();
        return students;
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students data. Please try again later.');
        return [];
    }
}

let attendanceHistory = [
    {
        date: "2025-05-08",
        classId: "CLS001",
        className: "Web Development",
        totalStudents: 4,
        present: 3,
        absent: 1,
        studentRecords: [
            {studentId: "STU001", studentName: "John Doe", status: "present", notes: ""},
            {studentId: "STU003", studentName: "Robert Johnson", status: "present", notes: "Late by 10 minutes"},
            {studentId: "STU004", studentName: "Emily Brown", status: "present", notes: ""},
            {studentId: "STU005", studentName: "Michael Davis", status: "absent", notes: "Sick leave"}
        ]
    },
    {
        date: "2025-05-08",
        classId: "CLS002",
        className: "Java Programming",
        totalStudents: 3,
        present: 2,
        absent: 1,
        studentRecords: [
            {studentId: "STU001", studentName: "John Doe", status: "present", notes: ""},
            {studentId: "STU002", studentName: "Jane Smith", status: "absent", notes: "No notice"},
            {studentId: "STU006", studentName: "Sarah Wilson", status: "present", notes: ""}
        ]
    },
    {
        date: "2025-05-06",
        classId: "CLS001",
        className: "Web Development",
        totalStudents: 4,
        present: 4,
        absent: 0,
        studentRecords: [
            {studentId: "STU001", studentName: "John Doe", status: "present", notes: ""},
            {studentId: "STU003", studentName: "Robert Johnson", status: "present", notes: ""},
            {studentId: "STU004", studentName: "Emily Brown", status: "present", notes: ""},
            {studentId: "STU005", studentName: "Michael Davis", status: "present", notes: ""}
        ]
    }
];

let currentAttendanceData = [];
let selectedClassId = "";
let selectedDate = "";

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('attendanceDate').valueAsDate = new Date();
    selectedDate = document.getElementById('attendanceDate').value;

    populateClassDropdowns();

    loadAttendanceHistory();
});

function populateClassDropdowns() {
    const classSelect = document.getElementById('classSelect');
    const historyClassSelect = document.getElementById('historyClassSelect');

    while (classSelect.options.length > 1) {
        classSelect.remove(1);
    }

    while (historyClassSelect.options.length > 1) {
        historyClassSelect.remove(1);
    }

    const activeClasses = classes.filter(cls => cls.status === 'active');
    activeClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classSelect.appendChild(option);
    });

    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        historyClassSelect.appendChild(option);
    });
}

async function loadStudentsForClass() {
    selectedClassId = document.getElementById('classSelect').value;

    if (!selectedClassId) {
        document.getElementById('attendanceSheet').style.display = 'none';
        document.getElementById('noStudentsMessage').style.display = 'block';
        return;
    }
    
    showLoading('attendanceContainer', 'Loading students for this class...');
    
    const classStudents = await loadStudents(selectedClassId);

    const selectedClass = classes.find(cls => cls.id === selectedClassId);
    if (!selectedClass) return;

    document.getElementById('attendanceClassTitle').textContent = `${selectedClass.name} - Attendance`;

    const studentsInClass = students.filter(student =>
        student.enrolledClasses.includes(selectedClassId)
    );

    if (studentsInClass.length === 0) {
        document.getElementById('attendanceSheet').style.display = 'none';
        document.getElementById('noStudentsMessage').style.display = 'block';
        return;
    }

    document.getElementById('attendanceSheet').style.display = 'block';
    document.getElementById('noStudentsMessage').style.display = 'none';

    loadAttendanceData();
}

function loadAttendanceData() {
    selectedDate = document.getElementById('attendanceDate').value;

    if (!selectedClassId || !selectedDate) return;

    const studentsInClass = students.filter(student =>
        student.enrolledClasses.includes(selectedClassId)
    );

    const existingAttendance = attendanceHistory.find(record =>
        record.classId === selectedClassId && record.date === selectedDate
    );

    currentAttendanceData = [];

    if (existingAttendance) {
        existingAttendance.studentRecords.forEach(record => {
            currentAttendanceData.push({
                studentId: record.studentId,
                studentName: record.studentName,
                status: record.status,
                notes: record.notes
            });
        });

        updateAttendanceSummary();
    } else {
        studentsInClass.forEach(student => {
            currentAttendanceData.push({
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                status: 'present',
                notes: ''
            });
        });

        updateAttendanceSummary();
    }

    populateAttendanceTable();
}

function populateAttendanceTable() {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    if (currentAttendanceData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="has-text-centered">No students to show</td>
            </tr>
        `;
        return;
    }

    currentAttendanceData.forEach((attendance, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${attendance.studentId}</td>
            <td>${attendance.studentName}</td>
            <td>
                <span class="tag ${attendance.status === 'present' ? 'is-success' : 'is-danger'}">
                    ${attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="field">
                    <div class="control">
                        <label class="radio">
                            <input type="radio" name="attendance_${index}" value="present" ${attendance.status === 'present' ? 'checked' : ''} onchange="updateAttendanceStatus(${index}, 'present')">
                            Present
                        </label>
                        <label class="radio">
                            <input type="radio" name="attendance_${index}" value="absent" ${attendance.status === 'absent' ? 'checked' : ''} onchange="updateAttendanceStatus(${index}, 'absent')">
                            Absent
                        </label>
                    </div>
                </div>
            </td>
            <td>
                <div class="field">
                    <div class="control">
                        <input class="input is-small" type="text" placeholder="Add notes" value="${attendance.notes}" onchange="updateAttendanceNotes(${index}, this.value)">
                    </div>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function updateAttendanceStatus(index, status) {
    if (index < 0 || index >= currentAttendanceData.length) return;

    currentAttendanceData[index].status = status;
    updateAttendanceSummary();
}

function updateAttendanceNotes(index, notes) {
    if (index < 0 || index >= currentAttendanceData.length) return;

    currentAttendanceData[index].notes = notes;
}

function markAllPresent() {
    if (currentAttendanceData.length === 0) return;

    currentAttendanceData.forEach((attendance, index) => {
        attendance.status = 'present';
    });

    populateAttendanceTable();
    updateAttendanceSummary();
}

function markAllAbsent() {
    if (currentAttendanceData.length === 0) return;

    currentAttendanceData.forEach((attendance, index) => {
        attendance.status = 'absent';
    });

    populateAttendanceTable();
    updateAttendanceSummary();
}

function updateAttendanceSummary() {
    if (currentAttendanceData.length === 0) {
        document.getElementById('attendanceSummary').textContent = 'No students';
        return;
    }

    const totalStudents = currentAttendanceData.length;
    const presentCount = currentAttendanceData.filter(a => a.status === 'present').length;
    const absentCount = totalStudents - presentCount;
    const presentPercentage = Math.round((presentCount / totalStudents) * 100);

    document.getElementById('attendanceSummary').innerHTML = `
        Total: ${totalStudents} | 
        Present: <span class="has-text-success">${presentCount}</span> | 
        Absent: <span class="has-text-danger">${absentCount}</span> | 
        Attendance: <strong>${presentPercentage}%</strong>
    `;
}

function saveAttendance() {
    if (currentAttendanceData.length === 0 || !selectedClassId || !selectedDate) {
        alert('No attendance data to save');
        return;
    }

    const selectedClass = classes.find(cls => cls.id === selectedClassId);
    if (!selectedClass) return;

    const totalStudents = currentAttendanceData.length;
    const presentCount = currentAttendanceData.filter(a => a.status === 'present').length;
    const absentCount = totalStudents - presentCount;

    const existingIndex = attendanceHistory.findIndex(record =>
        record.classId === selectedClassId && record.date === selectedDate
    );

    if (existingIndex !== -1) {
        attendanceHistory[existingIndex] = {
            date: selectedDate,
            classId: selectedClassId,
            className: selectedClass.name,
            totalStudents,
            present: presentCount,
            absent: absentCount,
            studentRecords: [...currentAttendanceData]
        };
    } else {
        attendanceHistory.push({
            date: selectedDate,
            classId: selectedClassId,
            className: selectedClass.name,
            totalStudents,
            present: presentCount,
            absent: absentCount,
            studentRecords: [...currentAttendanceData]
        });
    }

    loadAttendanceHistory();

    alert('Attendance saved successfully!');
}

function loadAttendanceHistory() {
    const classFilter = document.getElementById('historyClassSelect').value;
    const tableBody = document.getElementById('attendanceHistoryTableBody');
    tableBody.innerHTML = '';

    let filteredHistory = attendanceHistory;
    if (classFilter) {
        filteredHistory = attendanceHistory.filter(record => record.classId === classFilter);
    }

    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredHistory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="has-text-centered">No attendance records found</td>
            </tr>
        `;
        return;
    }

    filteredHistory.forEach(record => {
        const row = document.createElement('tr');
        const attendancePercentage = Math.round((record.present / record.totalStudents) * 100);

        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${record.className}</td>
            <td>${record.totalStudents}</td>
            <td>${record.present}</td>
            <td>${record.absent}</td>
            <td>
                <span class="tag ${attendancePercentage >= 80 ? 'is-success' : attendancePercentage >= 60 ? 'is-warning' : 'is-danger'}">
                    ${attendancePercentage}%
                </span>
            </td>
            <td>
                <div class="buttons are-small">
                    <button class="button is-info" onclick="viewAttendanceDetails('${record.classId}', '${record.date}')">
                        <span class="icon"><i class="fas fa-eye"></i></span>
                    </button>
                    <button class="button is-danger" onclick="deleteAttendanceRecord('${record.classId}', '${record.date}')">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
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

function viewAttendanceDetails(classId, date) {
    const record = attendanceHistory.find(r => r.classId === classId && r.date === date);

    if (!record) return;

    document.getElementById('attendanceDetailsTitle').textContent = `${record.className} - ${formatDate(record.date)}`;

    const tableBody = document.getElementById('attendanceDetailsTableBody');
    tableBody.innerHTML = '';

    if (record.studentRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="has-text-centered">No attendance details found</td>
            </tr>
        `;
    } else {
        record.studentRecords.forEach(student => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${student.studentId}</td>
                <td>${student.studentName}</td>
                <td>
                    <span class="tag ${student.status === 'present' ? 'is-success' : 'is-danger'}">
                        ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                </td>
                <td>${student.notes || '-'}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    document.getElementById('attendanceDetailsModal').classList.add('is-active');
}

function closeAttendanceDetailsModal() {
    document.getElementById('attendanceDetailsModal').classList.remove('is-active');
}

function printAttendanceDetails() {
    window.print();
}

function deleteAttendanceRecord(classId, date) {
    if (confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        attendanceHistory = attendanceHistory.filter(record =>
            !(record.classId === classId && record.date === date)
        );

        loadAttendanceHistory();

        alert('Attendance record deleted successfully!');
    }
}
