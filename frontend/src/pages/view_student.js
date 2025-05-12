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
            if (student.profilePic) {
                document.getElementById('profilePhotoCard').src = `data:image/jpeg;base64,${student.profilePic}`;
            } else {
                document.getElementById('profilePhotoCard').src = '../../public/profile-pic.png';
            }

            console.log('Student data loaded:', student);
            document.getElementById('stuName').textContent = `${student.fName || ''} ${student.lName || ''}`;
            document.getElementById('stuId').textContent = student.id;
            document.getElementById('stuAddress').textContent = student.address || 'N/A';
            document.getElementById('stuNic').textContent = student.nic || 'N/A';
            document.getElementById('stuContact').textContent = student.contact || 'N/A';

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
        
        const firstName = student.fName || student.firstName || '';
        const lastName = student.lName || student.lastName || '';
        const profilePicSrc = student.profilePic ? 
            `data:image/jpeg;base64,${student.profilePic}` : 
            '../../public/profile-pic.png';

        row.innerHTML = `
            <th id='rowId'>${student.id}</th>
            <td>${firstName}</td>
            <td>${lastName}</td>
            <td>${student.address || ''}</td>
            <td>${student.dob ? new Date(student.dob).toLocaleDateString() : ''}</td>
            <td>${student.nic || ''}</td>
            <td>${student.contact || ''}</td>
            <td>
                <figure class="image is-48x48">
                    <img src="${profilePicSrc}" alt="Profile Picture" class="is-rounded">
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
        await fetchStudents();
        document.getElementById('profileCard').style.display = "none";
    } catch (error) {
        console.error('Error:', error);
        alert('Error: Unable to delete student.');
    }
}

function editStudent(id) {
    const student = studentsArray.find(s => s.id === id);
    if (!student) {
        alert("Student not found");
        return;
    }

    window.location.href = `add_student.html?id=${id}`;
}