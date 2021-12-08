const threshold = 0.6
let pictureButtonCheck = document.querySelector('#take-picture-check');
let cameraButtonCheck = document.querySelector('#start-camera-check');
let closeButtonCheck = document.querySelector('#close-camera-check');
let streaming = false;
let width = 320;
let height = 0;
let videoCheck = document.querySelector('#video-check');
let canvasCheck  = document.querySelector('#canvas-check');
const checkForm = document.querySelector('.check');
let submitButton = document.querySelector('#submit-button')
let video = document.querySelector('#video-cam');
let image_file_check
let global_detection 

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
        const wrapDiv = document.querySelector('.wrap-check');
        wrapDiv.append(canvas);
        const displaySize = {
            width: videoCheck.width,
            height: videoCheck.height
        }
        faceapi.matchDimensions(canvas, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoCheck, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
            global_detection = detections
            const resizedDetections = await faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
            await faceapi.draw.drawDetections(canvas, resizedDetections)
            await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            }, 100)
});
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

submitButton.addEventListener('click',(e)=>{
    fetch('/check')
    .then(response => response.json())
    .then(data => {
        data.map( label => {
            // JSON.parse(label)
            console.log(label.image_descriptor)
        }
        )
        console.log(data)

        const faceMatcher = new faceapi.FaceMatcher(data, threshold)
        const results = data.map(fd => faceMatcher.findBestMatch(fd.descriptor))
        console.log(results)

    })
})
// checkForm.addEventListener('submit', (e)=>{
//     e.preventDefault();
//     const formData = new FormData(checkForm);
//     console.log(formData.values())
//     fetch('/check',{
//         method:'post',
//         body: formData,
//         headers:{
//             'Access-Control-Allow-Origin': '*'
//         }
//     }).then((response)=>{
//         return response.text();
//     }).then((text)=>{
//         console.log(text);
//     }).catch((err)=>{
//         console.error(err)
//     })
// })   

