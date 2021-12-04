// import {accessCamera,detectFace} from './detect';
let streaming = false;
let width = 320;
let height = 0;
let pictureButton = document.querySelector('#take-picture');
let cameraButton = document.querySelector('#start-camera');

// let pictureButtonCheck = document.querySelector('#take-picture-check');
let cameraButtonCheck = document.querySelector('#start-camera-check');
let video = document.querySelector('#video-cam');
const registerForm = document.querySelector('.register');


let videoCheck = document.querySelector('#video-check');
let canvasCheck  = document.querySelector('#canvas-check');
const checkForm = document.querySelector('.check');


let image_file
let image_file_check

const select = (el, all = false) =>{
    el = el.trim()
    if (all){
        return [...document.querySelectorAll(el)]
    } else {
        return document.querySelector(el)
    }
}

  /**
   * Easy event listener function
   */
   const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }


  /**
   * Sidebar toggle
   */
   if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function(e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }
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

cameraButton.addEventListener('click', async ()=>{
    await faceapi.loadTinyFaceDetectorModel('/models')
    await faceapi.loadSsdMobilenetv1Model('/models')
    await faceapi.loadFaceLandmarkModel('/models')
    await faceapi.loadFaceRecognitionModel('/models')
    navigator.mediaDevices.getUserMedia({ video: true , audio:false})
    .then(function (stream) {
    video.srcObject = stream;
    // video.play();    
    })
    .catch(function (error) {
    console.log("Something went wrong!");
    console.error(error)
});
});

pictureButton.addEventListener('click', function(){
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    image_file = dataUrlToFile(image_data_url, 'imagetaken.png')
    console.log(image_file);
})

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

video.addEventListener('play', ()=>{
    if (!streaming){
        height = video.videoHeight / (video.videoWidth / width);
        if (isNaN(height)){
            height = width / (4/3);
        }
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        }
        const canvas = faceapi.createCanvasFromMedia(video)
        const wrapDiv = document.querySelector('.wrap');
    
        wrapDiv.append(canvas);
    
        const displaySize = {
            width: video.width,
            height: video.height
        }
        faceapi.matchDimensions(canvas, displaySize)
    
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
            const resizedDetections = await faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
            await faceapi.draw.drawDetections(canvas, resizedDetections)
            await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            }, 100)
})
/*Check form */

cameraButtonCheck.addEventListener('click', async function(){
    await faceapi.loadTinyFaceDetectorModel('/models')
    await faceapi.loadSsdMobilenetv1Model('/models')
    await faceapi.loadFaceLandmarkModel('/models')
    await faceapi.loadFaceRecognitionModel('/models')
    navigator.mediaDevices.getUserMedia({ video: true, audio: false})
    .then(function(stream){
    videoCheck.srcObject = stream;
     });
 });
 
//  pictureButtonCheck.addEventListener('click', function(){
//      canvasCheck.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
//      let image_data_url = canvas.toDataURL('image/jpeg');
//      image_file_check = dataUrlToFile(image_data_url, 'imagecheck.png');
//  })
 

videoCheck.addEventListener('play',()=>{
    if (!streaming){
        height = videoCheck.videoHeight / (videoCheck.videoWidth / width);
        if (isNaN(height)){
            height = width / (4/3);
        }
        videoCheck.setAttribute('width', width);
        videoCheck.setAttribute('height', height);
        videoCheck.setAttribute('width', width);
        videoCheck.setAttribute('height', height);
        }
        const canvas = faceapi.createCanvasFromMedia(videoCheck)
        console.log(canvas)
        const wrapDiv = document.querySelector('.wrap-check');
        
        wrapDiv.append(canvas);
    
        const displaySize = {
            width: videoCheck.width,
            height: videoCheck.height
        }
        faceapi.matchDimensions(canvas, displaySize)
    
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoCheck, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
            const resizedDetections = await faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
            await faceapi.draw.drawDetections(canvas, resizedDetections)
            await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            }, 100)
});

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



