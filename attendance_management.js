/**
 * Attendance Management JavaScript
 * Handles functionality for the attendance management page including:
 * - Loading students for a class
 * - Marking attendance
 * - Saving attendance records
 * - Viewing attendance history
 */

// Mock data for demonstration
let classes = [
    {
        id: "CLS001",
        name: "Web Development",
        schedule: "Mon, Wed 10:00-12:00",
        status: "active"
    },
    {
        id: "CLS002",
        name: "Java Programming",
        schedule: "Tue, Thu 14:00-16:00",
        status: "active"
    },
    {
        id: "CLS003",
        name: "Database Design",
        schedule: "Fri 09:00-13:00",
        status: "upcoming"
    },
    {
        id: "CLS004",
        name: "Mobile App Development",
        schedule: "Mon, Wed 14:00-16:00",
        status: "upcoming"
    },
    {
        id: "CLS005",
        name: "Python for Data Science",
        schedule: "Tue, Thu 09:00-11:00",
        status: "completed"
    }
];

let students = [
    { id: "STU001", firstName: "John", lastName: "Doe", enrolledClasses: ["CLS001", "CLS002"] },
    { id: "STU002", firstName: "Jane", lastName: "Smith", enrolledClasses: ["CLS002"] },
    { id: "STU003", firstName: "Robert", lastName: "Johnson", enrolledClasses: ["CLS001"] },
    { id: "STU004", firstName: "Emily", lastName: "Brown", enrolledClasses: ["CLS001", "CLS002"] },
    { id: "STU005", firstName: "Michael", lastName: "Davis", enrolledClasses: ["CLS001"] },
    { id: "STU006", firstName: "Sarah", lastName: "Wilson", enrolledClasses: ["CLS002", "CLS001"] }
];

// Mock attendance history
let attendanceHistory = [
    {
        date: "2025-05-08",
        classId: "CLS001",
        className: "Web Development",
        totalStudents: 4,
        present: 3,
        absent: 1,
        studentRecords: [
            { studentId: "STU001", studentName: "John Doe", status: "present", notes: "" },
            { studentId: "STU003", studentName: "Robert Johnson", status: "present", notes: "Late by 10 minutes" },
            { studentId: "STU004", studentName: "Emily Brown", status: "present", notes: "" },
            { studentId: "STU005", studentName: "Michael Davis", status: "absent", notes: "Sick leave" }
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
            { studentId: "STU001", studentName: "John Doe", status: "present", notes: "" },
            { studentId: "STU002", studentName: "Jane Smith", status: "absent", notes: "No notice" },
            { studentId: "STU006", studentName: "Sarah Wilson", status: "present", notes: "" }
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
            { studentId: "STU001", studentName: "John Doe", status: "present", notes: "" },
            { studentId: "STU003", studentName: "Robert Johnson", status: "present", notes: "" },
            { studentId: "STU004", studentName: "Emily Brown", status: "present", notes: "" },
            { studentId: "STU005", studentName: "Michael Davis", status: "present", notes: "" }
        ]
    }
];

// Current attendance sheet data
let currentAttendanceData = [];
let selectedClassId = "";
let selectedDate = "";

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Set today's date as default
    document.getElementById('attendanceDate').valueAsDate = new Date();
    selectedDate = document.getElementById('attendanceDate').value;

    // Populate class dropdown menus
    populateClassDropdowns();

    // Load attendance history
    loadAttendanceHistory();
});

// Populate class dropdowns
function populateClassDropdowns() {
    const classSelect = document.getElementById('classSelect');
    const historyClassSelect = document.getElementById('historyClassSelect');

    // Clear existing options except the first one
    while (classSelect.options.length > 1) {
        classSelect.remove(1);
    }

    while (historyClassSelect.options.length > 1) {
        historyClassSelect.remove(1);
    }

    // Only add active classes to main dropdown
    const activeClasses = classes.filter(cls => cls.status === 'active');
    activeClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classSelect.appendChild(option);
    });

    // Add all classes to history dropdown
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        historyClassSelect.appendChild(option);
    });
}

// Load students for selected class
function loadStudentsForClass() {
    selectedClassId = document.getElementById('classSelect').value;

    if (!selectedClassId) {
        document.getElementById('attendanceSheet').style.display = 'none';
        document.getElementById('noStudentsMessage').style.display = 'block';
        return;
    }

    // Get the selected class
    const selectedClass = classes.find(cls => cls.id === selectedClassId);
    if (!selectedClass) return;

    // Set the class title
    document.getElementById('attendanceClassTitle').textContent = `${selectedClass.name} - Attendance`;

    // Get students in this class
    const studentsInClass = students.filter(student =>
        student.enrolledClasses.includes(selectedClassId)
    );

    if (studentsInClass.length === 0) {
        document.getElementById('attendanceSheet').style.display = 'none';
        document.getElementById('noStudentsMessage').style.display = 'block';
        return;
    }

    // Show the attendance sheet
    document.getElementById('attendanceSheet').style.display = 'block';
    document.getElementById('noStudentsMessage').style.display = 'none';

    // Load attendance data if available for this date
    loadAttendanceData();
}

// Load attendance data for selected class and date
function loadAttendanceData() {
    selectedDate = document.getElementById('attendanceDate').value;

    if (!selectedClassId || !selectedDate) return;

    // Get students in this class
    const studentsInClass = students.filter(student =>
        student.enrolledClasses.includes(selectedClassId)
    );

    // Check if attendance already exists for this date and class
    const existingAttendance = attendanceHistory.find(record =>
        record.classId === selectedClassId && record.date === selectedDate
    );

    // Prepare attendance data
    currentAttendanceData = [];

    if (existingAttendance) {
        // Use existing attendance data
        existingAttendance.studentRecords.forEach(record => {
            currentAttendanceData.push({
                studentId: record.studentId,
                studentName: record.studentName,
                status: record.status,
                notes: record.notes
            });
        });

        // Update attendance summary
        updateAttendanceSummary();
    } else {
        // Create new attendance entries for each student
        studentsInClass.forEach(student => {
            currentAttendanceData.push({
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                status: 'present', // Default to present
                notes: ''
            });
        });

        // Update attendance summary
        updateAttendanceSummary();
    }

    // Populate the attendance table
    populateAttendanceTable();
}

// Populate the attendance table
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

// Update attendance status for a student
function updateAttendanceStatus(index, status) {
    if (index < 0 || index >= currentAttendanceData.length) return;

    currentAttendanceData[index].status = status;
    updateAttendanceSummary();
}

// Update attendance notes for a student
function updateAttendanceNotes(index, notes) {
    if (index < 0 || index >= currentAttendanceData.length) return;

    currentAttendanceData[index].notes = notes;
}

// Mark all students as present
function markAllPresent() {
    if (currentAttendanceData.length === 0) return;

    currentAttendanceData.forEach((attendance, index) => {
        attendance.status = 'present';
    });

    populateAttendanceTable();
    updateAttendanceSummary();
}

// Mark all students as absent
function markAllAbsent() {
    if (currentAttendanceData.length === 0) return;

    currentAttendanceData.forEach((attendance, index) => {
        attendance.status = 'absent';
    });

    populateAttendanceTable();
    updateAttendanceSummary();
}

// Update attendance summary
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

// Save attendance records
function saveAttendance() {
    if (currentAttendanceData.length === 0 || !selectedClassId || !selectedDate) {
        alert('No attendance data to save');
        return;
    }

    // Get the selected class
    const selectedClass = classes.find(cls => cls.id === selectedClassId);
    if (!selectedClass) return;

    // Calculate attendance summary
    const totalStudents = currentAttendanceData.length;
    const presentCount = currentAttendanceData.filter(a => a.status === 'present').length;
    const absentCount = totalStudents - presentCount;

    // Check if attendance already exists for this date and class
    const existingIndex = attendanceHistory.findIndex(record =>
        record.classId === selectedClassId && record.date === selectedDate
    );

    if (existingIndex !== -1) {
        // Update existing attendance record
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
        // Add new attendance record
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

    // Reload attendance history
    loadAttendanceHistory();

    alert('Attendance saved successfully!');
}

// Load attendance history
function loadAttendanceHistory() {
    const classFilter = document.getElementById('historyClassSelect').value;
    const tableBody = document.getElementById('attendanceHistoryTableBody');
    tableBody.innerHTML = '';

    // Filter history by class if selected
    let filteredHistory = attendanceHistory;
    if (classFilter) {
        filteredHistory = attendanceHistory.filter(record => record.classId === classFilter);
    }

    // Sort by date (newest first)
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

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// View attendance details
function viewAttendanceDetails(classId, date) {
    // Find the attendance record
    const record = attendanceHistory.find(r => r.classId === classId && r.date === date);

    if (!record) return;

    // Set modal title
    document.getElementById('attendanceDetailsTitle').textContent = `${record.className} - ${formatDate(record.date)}`;

    // Populate the details table
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

    // Show the modal
    document.getElementById('attendanceDetailsModal').classList.add('is-active');
}

// Close attendance details modal
function closeAttendanceDetailsModal() {
    document.getElementById('attendanceDetailsModal').classList.remove('is-active');
}

// Print attendance details
function printAttendanceDetails() {
    window.print();
}

// Delete attendance record
function deleteAttendanceRecord(classId, date) {
    if (confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        attendanceHistory = attendanceHistory.filter(record =>
            !(record.classId === classId && record.date === date)
        );

        // Reload attendance history
        loadAttendanceHistory();

        alert('Attendance record deleted successfully!');
    }
}
