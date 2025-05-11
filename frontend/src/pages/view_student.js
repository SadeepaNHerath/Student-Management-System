import ApiService from '../services/api.service.js';
import {API_BASE_URL} from '../utils/constants.js';

const profilePhoto = document.getElementById('profilePhoto');
const searchInput = document.getElementById('searchId');
const searchButton = document.getElementById('searchBtn');
const previousButton = document.getElementById('previousBtn');
const nextButton = document.getElementById('nextBtn');
const editButton = document.getElementById('editBtn');
const deleteButton = document.getElementById('deleteBtn');

let studentId;
let studentsArray = [];
let nextIndex;
let prevIndex;

async function fetchStudents() {
    try {
        studentsArray = await ApiService.getStudents();
        
        if (!studentsArray) {
            throw new Error('Failed to fetch students');
        }
        
        loadStudents();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load students data. Please try again later.');
    }
}

async function loadProfile() {
    try {
        studentId = searchInput.value;
        const student = await ApiService.getStudent(studentId);
        
        if (student) {
            document.getElementById('profilePhotoCard').src = `data:image/jpeg;base64,${student.profilePic}`;

            document.getElementById('stuName').textContent = `${student.fName} ${student.lName}`;
            document.getElementById('stuId').textContent = student.id;
            document.getElementById('stuAddress').textContent = student.address;
            document.getElementById('stuNic').textContent = student.nic;
            document.getElementById('stuContact').textContent = student.contact;

            // document.getElementById('prevBtn').href = `/previous/${student.id}`;
            // document.getElementById('nextBtn').href = `/next/${student.id}`;

            document.getElementById('editBtn').addEventListener('click', () => {
                editStudent(student.id);
            });
            document.getElementById('deleteBtn').addEventListener('click', () => {
                deleteStudent(student.id);
            });
            document.getElementById('profileCard').style.display = "block";
        } else {
            console.error('Student not found');
        }
    } catch (error) {
        console.error('Error fetching student data:', error);
    }
    
    searchInput.value = '';
}


function loadStudents() {
    const tableBody = document.getElementById('studentTableBody');
    tableBody.innerHTML = '';

    studentsArray.forEach(student => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-right');
        prevIndex = row.previousElementSibling.getElementById('rowId');
        nextIndex = row.nextElementSibling.getElementById('rowId');

        row.innerHTML = `
            <th id='rowId'>${student.id}</th>
            <td>${student.firstName}</td>
            <td>${student.lastName}</td>
            <td>${student.address}</td>
            <td>${student.dob}</td>
            <td>${student.nic}</td>
            <td>${student.contact}</td>
            <td>
                <figure class="image is-48x48">
                    <img src="data:image/jpeg;base64,${student.profilePic}" alt="Profile Picture" class="is-rounded">
                </figure>
            </td>
            <td>
                <div class="buttons">
                    <button class="button is-small is-warning" onclick="editStudent(${student.id})" data-aos="fade-right">
                        <span class="icon is-small">
                            <i class="fas fa-edit"></i>
                        </span>
                    </button>
                    <button class="button is-small is-danger" onclick="deleteStudent(${student.id})" data-aos="fade-left">
                        <span class="icon is-small">
                            <i class="fas fa-trash"></i>
                        </span>
                    </button>
                </div>
            </td>
        `;

        row.addEventListener('click', () => {
            searchInput.value = student.id;
            loadProfile();
        });

        tableBody.appendChild(row);
    });

    document.getElementById('studentTable').style.display = 'table';
}

document.addEventListener('DOMContentLoaded', function () {
    fetchStudents();
    loadProfile();
});

searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        loadProfile()
    }
})

async function deleteStudent(id) {
    const confirmed = confirm("Are you sure you want to delete this student?");

    if (!confirmed) {
        return;
    }

    try {
        await ApiService.deleteStudent(id);
        alert("Student deleted successfully");
        await fetchStudents(); // Refresh the student list
        document.getElementById('profileCard').style.display = "none"; // Hide the profile card
    } catch (error) {
        console.error('Error:', error);
        alert('Error: Unable to delete student.');
    }
}

function editStudent() {


}