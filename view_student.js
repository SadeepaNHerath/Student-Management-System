const profilePhoto = document.getElementById('profilePhoto');
const searchInput = document.getElementById('searchId');
const searchButton = document.getElementById('searchBtn');
const previousButton = document.getElementById('previousBtn');
const nextButton = document.getElementById('nextBtn');
const editButton = document.getElementById('editBtn');
const deleteButton = document.getElementById('deleteBtn');
let studentId;

function loadProfile() {
    studentId = searchInput.value;
    if (studentId == '' || studentId == null) {
        studentId = '1';
    }
    fetch(`http://localhost:8080/student/students/${studentId}`)
        .then(response => response.json())
        .then(student => {
            if (student) {
                document.getElementById('profilePhotoCard').src = `data:image/jpeg;base64,${student.profilePic}`;

                document.getElementById('stuName').textContent = `${student.fName} ${student.lName}`;
                document.getElementById('stuId').textContent = student.id;
                document.getElementById('stuAddress').textContent = student.address;
                document.getElementById('stuNic').textContent = student.nic;
                document.getElementById('stuContact').textContent = student.contact;

                document.getElementById('prevBtn').href = `/previous/${student.id}`;
                document.getElementById('nextBtn').href = `/next/${student.id}`;

                document.getElementById('editBtn').href = `/edit/${student.id}`;
                document.getElementById('deleteBtn').href = `/delete/${student.id}`;

                document.getElementById('profileCard').style.display = "block";
            } else {
                console.error('Student not found');
            }
        })
        .catch(error => console.error('Error fetching student data:', error));
        searchInput.value = '';
}


function loadStudents() {
    fetch('http://localhost:8080/student/students')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(students => {
            const tableBody = document.getElementById('studentTableBody');
            tableBody.innerHTML = '';

            students.forEach(student => {
                const row = document.createElement('tr');
                row.setAttribute('data-aos', 'fade-right');

                row.innerHTML = `
                    <th scope="row">${student.id}</th>
                    <td>${student.firstName}</td>
                    <td>${student.lastName}</td>
                    <td>${student.address}</td>
                    <td>${student.dob}</td>
                    <td>${student.nic}</td>
                    <td>${student.contact}</td>
                    <td>
                        <img src="data:image/jpeg;base64,${student.profilePic}" 
                            alt="Profile Picture" 
                            class="img-thumbnail" 
                            style="width: 50px; height: 50px;">
                    </td>
                `;
                row.addEventListener('click', () => {
                    searchInput.value = student.id;
                    loadProfile();
                });

                tableBody.appendChild(row);
            });

            document.getElementById('studentTable').style.display = 'table';
        })
        .catch(error => console.error('Error fetching students:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    loadStudents();
});

searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        loadProfile()
    }
})