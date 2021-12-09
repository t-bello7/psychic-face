let streaming = false;
let width = 320;
let height = 0;
let pictureButton = document.querySelector('#take-picture');
let cameraButton = document.querySelector('#start-camera');
let closeButton = document.querySelector('#close-camera');

let video = document.querySelector('#video-cam');
const registerForm = document.querySelector('.register');


let facedescriptor
let image_file
let image_file_check
let localstream;

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



cameraButton.addEventListener('click', async () => {
    navigator.mediaDevices.getUserMedia({ video: true , audio:false})
    .then(function (stream) {
    video.srcObject = stream;
    localstream = stream;
    // video.play();    
    })
    .catch(function (error) {
    console.log("Something went wrong!");
    console.error(error)
});
    await faceapi.loadTinyFaceDetectorModel('/models')
    await faceapi.loadSsdMobilenetv1Model('/models')
    await faceapi.loadFaceLandmarkModel('/models')
    await faceapi.loadFaceRecognitionModel('/models')
});
    


pictureButton.addEventListener('click', function(){
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    image_file = dataUrlToFile(image_data_url, 'imagetaken.png')
})

closeButton.addEventListener('click', function(){
    video.pause();
    video.currentTime = 0;
    video.srcObject = null;
    const tracks = localstream.getTracks()
    tracks.forEach(function(track){
        track.stop();
    })
    localstream = '';
})


video.addEventListener('play', async ()=>{
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
            if (!detections[0]){
                throw new Error(`no face detected`)
            }

        facedescriptor = [detections[0].descriptor]          
            const resizedDetections = await faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
            await faceapi.draw.drawDetections(canvas, resizedDetections)
            await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        }, 100)  

})

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    let labeledDescriptor = new faceapi.LabeledFaceDescriptors(formData.get('firstName'),facedescriptor)
    labeledDescriptor = labeledDescriptor.toJSON()
    labeledDescriptor = JSON.stringify(labeledDescriptor)
    if (formData.get('studentImage').name == '' ){
        formData.set('studentImage', image_file)
    }
    formData.set('faceDescriptor', labeledDescriptor)
    fetch('/register',{
        method: 'post',
        body: formData,
        headers:{
            'Access-Control-Allow-Origin': '*'
        }
    }).then( ()=>{
        window.location.assign('/all-students');
    }).catch ((err)=>
    {
        console.error(err)

    })
})




