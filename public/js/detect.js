let width = 320;
let height = 0;
let streaming = false;
let video = null;
let canvas = null;
let photo = null;
let startbutton = null;

video = document.querySelector("#webcam");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.loadTinyFaceDetectorModel('/models'),
    faceapi.loadSsdMobilenetv1Model('/models'),
    faceapi.loadFaceLandmarkModel('/models'),
    faceapi.loadFaceRecognitionModel('/models'),

]).then(startup)

function startup(){
    if (navigator.mediaDevices.getUserMedia){
        canvas = document.querySelector('.video');
        video = document.querySelector("#webcam");

        navigator.mediaDevices.getUserMedia({ video: true , audio:false})
            .then(function (stream) {
            video.srcObject = stream;
            // video.play();    
            })
            .catch(function (error) {
            console.log("Something went wrong!");
            console.error(error)
        });

    }
    else{
        alert("Connect your webcam")
        // manipluate dom to print connect a webcam 
        // or allow mediadevices on browser
    }
}

video.addEventListener('play', () => {
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
    // streaming = true;

    const canvas = faceapi.createCanvasFromMedia(video)
    const wrapDiv = document.querySelector('.wrap');

    wrapDiv.append(canvas);
    console.log(video.height)
    console.log(video.width)
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

// window.addEventListener('load', startup, false);

startup();