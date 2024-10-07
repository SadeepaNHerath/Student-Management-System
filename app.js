let fName = document.getElementById('fName');
let lName = document.getElementById('lName');
let address = document.getElementById('address');
let dob = document.getElementById('dob');
let nic = document.getElementById('nic');
let contact = document.getElementById('contact');
let photo = document.getElementById('photo');







document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = document.getElementById('profilePhoto');
            image.src = e.target.result;
            
            const cropper = new Cropper(image, {
                aspectRatio: 1,
                viewMode: 1,
                ready() {
                    console.log('Cropper is ready');
                }
            });

            document.querySelector('.btn-warning').addEventListener('click', function() {
                const canvas = cropper.getCroppedCanvas();
                image.src = canvas.toDataURL();
                cropper.destroy();
            });
        };
        reader.readAsDataURL(file);
    }
});


document.getElementById('photo').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imagePreview = document.getElementById('image-preview');
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.classList.remove('d-none');
            imagePreview.src = e.target.result;
            
            const cropper = new Cropper(imagePreview, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                ready() {
                    // Add any additional functionality here if needed
                }
            });
        };
        reader.readAsDataURL(file);
    }
});