let width = 320;
let height = 0;
let streaming = false;
let video = null;
let canvas = null;
let photo = null;
let startbutton = null;

video = document.querySelector("#webcam");
let detectButton = document.querySelector('#detectbutton');
// Promise.all([
//     faceapi.loadTinyFaceDetectorModel('/models'),
//     faceapi.loadSsdMobilenetv1Model('/models'),
//     faceapi.loadFaceLandmarkModel('/models'),
//     faceapi.loadFaceRecognitionModel('/models'),
// ]).then(accessCamera)

export async function accessCamera(){
    console.log('clicked detect')
    await faceapi.loadTinyFaceDetectorModel('/models')
    await faceapi.loadSsdMobilenetv1Model('/models')
    await faceapi.loadFaceLandmarkModel('/models')
    await faceapi.loadFaceRecognitionModel('/models')
    if(navigator.mediaDevices.getUserMedia){
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
    }
}

export function detectFace(){
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
        const canvas = faceapi.createCanvasFromMedia(videoCheck)
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
}

video.addEventListener('play', detectFace);
detectButton.addEventListener('click', accessCamera);
