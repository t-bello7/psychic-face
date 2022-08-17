const pictureButtonCheck = document.querySelector('#take-picture-check');
const cameraButtonCheck = document.querySelector('#start-camera-check');
const closeButtonCheck = document.querySelector('#close-camera-check');
const videoCheck = document.querySelector('#video-check');
const canvasCheck  = document.querySelector('#canvas-check');
const checkForm = document.querySelector('.check');
const submitButton = document.querySelector('#submit-button')
const video = document.querySelector('#video-cam');
const output = document.querySelector('.verify-output');
const modalCloseButton = document.querySelector('#close-modal');
let streaming = false;
let width = 320;
let height = 0;
let image;
const threshold = 0.6
let image_file_check
let globalDetection

if(cameraButtonCheck){
    cameraButtonCheck.addEventListener('click', async function(){
        navigator.mediaDevices.getUserMedia({ video: true, audio: false})
        .then(function(stream){
            videoCheck.srcObject = stream;
         });
        await faceapi.loadTinyFaceDetectorModel('/models')
        await faceapi.loadSsdMobilenetv1Model('/models')
        await faceapi.loadFaceLandmarkModel('/models')
        await faceapi.loadFaceRecognitionModel('/models')
     });    
}

if (videoCheck){
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
}

if (closeButtonCheck){
    closeButtonCheck.addEventListener('click', function(){
        videoCheck.pause();
        videoCheck.currentTime = 0;
        videoCheck.srcObject = null;
        const tracks = localstream.getTracks()
        tracks.forEach(function(track){
            track.stop();
        })
        localstream = '';
    })    
}

if (pictureButtonCheck){
    pictureButtonCheck.addEventListener('click', async function(){
        canvasCheck.getContext('2d').drawImage(videoCheck, 0, 0, canvasCheck.width, canvasCheck.height);
        image = canvasCheck
        globalDetection = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    })
}

if (submitButton){
    submitButton.addEventListener('click',(e)=>{
        fetch('/check')
        .then(response => response.json())
        .then(data => {        
            // let descriptor_obj 
            let floatArray
            let labeledDescriptor 
            labeledDescriptor =  data.map( item => {
                floatArray = new Float32Array(item.image_descriptor.descriptors[0])
                floatArray = [floatArray]
                return new faceapi.LabeledFaceDescriptors(item.image_descriptor.label, floatArray)
            })
    
            console.log(labeledDescriptor)
            // reference
            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptor, threshold)
            console.log(faceMatcher)
    
            // recognize
            const results = globalDetection.map(fd => faceMatcher.findBestMatch(fd.descriptor))
            output.innerHTML += `
            Yes this is , ${results[0].label}
            `
            console.log(results[0])
        })
    })
}


if (modalCloseButton){
    modalCloseButton.addEventListener('click', ()=>{
        output.innerHTML = "";
    })
}


