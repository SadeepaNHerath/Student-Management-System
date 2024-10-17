const profilePhoto = document.getElementById('profilePhoto');
const fileInput = document.getElementById('fileInput');
const fName = document.getElementById('fName');
const lName = document.getElementById('lName');
const address = document.getElementById('address');
const dob = document.getElementById('dob');
const nic = document.getElementById('nic');
const contact = document.getElementById('contact');
const addBtn = document.getElementById('addBtn');

async function addStudent() {
    if (fileInput.files.length > 0) {
        const student = {
            fName: fName.value,
            lName: lName.value,
            address: address.value,
            dob: dob.value,
            nic: nic.value,
            contact: contact.value
        };

        
        const formData = new FormData();
        formData.append('student', new Blob([JSON.stringify(student)], { type: 'application/json' }));
        formData.append('profilePic', fileInput.files[0]);
        const studentBlob = formData.get('student');
        try {
            const response = await fetch('http://localhost:8080/student/students', {
                method: 'POST',
                body: formData,
                redirect: 'follow'
            });

            if (response.ok) {
                alert("Student added successfully");
                clearForm();
            } else {
                alert("Failed to add student");
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    } else {

    }
}

function clearForm() {
    fName.value = '';
    lName.value = '';
    address.value = '';
    dob.value = '';
    nic.value = '';
    contact.value = '';
    profilePhoto.src = 'img src/profile-pic.png';
    fileInput.value = '';
}

fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profilePhoto.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function loadFile(event) {
    var image = document.getElementById('profilePhoto');
    image.src = URL.createObjectURL(event.target.files[0]);
}

