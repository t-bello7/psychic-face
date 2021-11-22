let pictureButton = document.querySelector('#take-picture');
let cameraButton = document.querySelector('#start-camera');

let pictureButtonCheck = document.querySelector('#take-picture-check');
let cameraButtonCheck = document.querySelector('#start-camera-check');


let video = document.querySelector('#video');
let canvas = document.querySelector('#canvas');


let videoCheck = document.querySelector('#video-check');
let canvasCheck  = document.querySelector('#canvas-check');


let image_file
let image_file_check

function dataUrlToFile(dataurl ,filename){
    var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), 
    n = bstr.length, 
    u8arr = new Uint8Array(n);
    
    while(n--){
    u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
} 


cameraButton.addEventListener('click', function(){
   navigator.mediaDevices.getUserMedia({ video: true, audio: false})
   .then(function(stream){
   video.srcObject = stream;
    });
});

pictureButton.addEventListener('click', function(){
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    image_file = dataUrlToFile(image_data_url, 'imagetaken.png')
    console.log(image_file);
})

const registerForm = document.querySelector('.register');


registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);

    console.log(formData.get('studentImage'))

    if (formData.get('studentImage').name == '' ){
        formData.set('studentImage', image_file)
    }

    console.log(formData.get('studentImage'))
    fetch('/register',{
        method: 'post',
        body: formData,
        headers:{
            'Access-Control-Allow-Origin': '*'
        }
    }).then ((response)=>{
        return response.text();
    }).then((text)=>{
        console.log(text);
    }).catch ((err)=>
    {
        console.error(err)
    })
})

/*Check form */

cameraButtonCheck.addEventListener('click', function(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: false})
    .then(function(stream){
    videoCheck.srcObject = stream;
     });
 });
 
 pictureButtonCheck.addEventListener('click', function(){
     canvasCheck.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
     let image_data_url = canvas.toDataURL('image/jpeg');
     image_file_check = dataUrlToFile(image_data_url, 'imagecheck.png');
 })
 
const checkForm = document.querySelector('.check');
checkForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const formData = new FormData(checkForm);
    console.log(formData.values())
    fetch('/check',{
        method:'post',
        body: formData,
        headers:{
            'Access-Control-Allow-Origin': '*'
        }
    }).then((response)=>{
        return response.text();
    }).then((text)=>{
        console.log(text);
    }).catch((err)=>{
        console.error(err)
    })
})   