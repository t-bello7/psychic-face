import * as faceapi from './face-api.js';
// import * as faceapi1 from '../../node_modules/face-api.js'

(function(){
    
    let width = 320;
    let height = 0;
    let streaming = false;
    let video = null;
    let canvas = null;
    let photo = null;
    let startbutton = null;
    function startup(){
        if (navigator.mediaDevices.getUserMedia) {
            video = document.querySelector("#webcam");
            canvas = document.querySelector('.video');
            let faceCanvas = document.querySelector('.face');
            console.log(faceCanvas)
            photo = document.querySelector('#photo');
            startbutton = document.getElementById('startbutton');
            let verify = document.querySelector('#verify')
            let studentId = document.querySelector('#studentId')
            const ctx = canvas.getContext('2d');
            const faceCtx = faceCanvas.getContext('2d');
            navigator.mediaDevices.getUserMedia({ video: true , audio:false})
                .then(function (stream) {
                video.srcObject = stream;
                video.play();
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                faceCanvas.width = video.videoWidth;
                faceCanvas.height = video.videoHeight;
                })
                .catch(function (error) {
                console.log("Something went wrong!");
            });
            

            video.addEventListener('canplay', function(ev){
                if (!streaming){
                    height = video.videoHeight / (video.videoWidth / width);
                    if (isNaN(height)){
                        height = width / (4/3);
                    }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                video.setAttribute('width', width);
                video.setAttribute('height', height);
                streaming = true;
                }
            }, false);
            console.dir(faceapi)
            let fullFaceDescriptions = faceapi.detectSingleFace(video).withFaceLandmark().withFaceDescriptor()
            fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions)
            faceapi.draw.drawDetections(faceCanvas, fullFaceDescriptions)

            startbutton.addEventListener('click', function(ev){
            takepicture();
            ev.preventDefault();
            }, false);

            verifybutton.addEventListener('click', function(ev){
                verifypicture(`/check/${studentId}`, photo).then(
                    data => {
                        // manipulate to say student is in your class
                    }
                );
                ev.preventDefault();
            }, false)

        clearPhoto();
}
else{
        // manipluate dom to print connect a webcam 
        // or allow mediadevices on browser
    }
 }
    function clearPhoto(){
        let photocontext = canvas.getContext('2d');
        photocontext.fillStyle = "#AAA";
        photocontext.fillRect(0,0, canvas.width, canvas.height);
        
        let data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }
    function takepicture(){
        let photocontext = canvas.getContext('2d');
        if (width && height){
            canvas.width = width;
            canvas.height = height;
            photocontext.drawImage(video, 0, 0, width, height);
            let data = canvas.toDataURL('image/png');
            let data64 = data.replace('data:image/png;base64,', '');
            photo.setAttribute('src', data);
            }
            else {
            clearPhoto();
        }
    
    }

    async function verifypicture(url = '',img){
        // img 
        const response = await fetch(url, {
            method: 'get',
        })
        return response.json()

        // run face recognition
        // manipulate dom to reply yes student is in your class

    }
   
    // let temp = []
    // // $("#videoElement").bind("loadedmetadata", function(){
    //     displaySize = { width:this.scrollWidth, height: this.scrollHeight }

    //     async function detect(){

    //         const MODEL_URL = '/models'

    //         await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    //         await faceapi.loadFaceLandmarkModel(MODEL_URL)
    //         await faceapi.loadFaceRecognitionModel(MODEL_URL)

    //         let canvas = $("#canvas").get(0);

    //         facedetection = setInterval(async () =>{

    //             let fullFaceDescriptions = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
    //             let canvas = $("#canvas").get(0);
    //             faceapi.matchDimensions(canvas, displaySize)

    //             const fullFaceDescription = faceapi.resizeResults(fullFaceDescriptions, displaySize)
    //             // faceapi.draw.drawDetections(canvas, fullFaceDescriptions)

    //             const labels = ["img/steveoni"]

    //             const labeledFaceDescriptors = await Promise.all(
    //                 labels.map(async label => {
    //                     // fetch image data from urls and convert blob to HTMLImage element
    //                     const imgUrl = `${label}.JPG`
    //                     const img = await faceapi.fetchImage(imgUrl)
                        
    //                     // detect the face with the highest score in the image and compute it's landmarks and face descriptor
    //                     const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                        
    //                     if (!fullFaceDescription) {
    //                     throw new Error(`no faces detected for ${label}`)
    //                     }
                        
    //                     const faceDescriptors = [fullFaceDescription.descriptor]
    //                     return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
    //                 })
    //             );

    //             const maxDescriptorDistance = 0.6
    //             const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

    //             const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))

    //             results.forEach((bestMatch, i) => {
    //                 const box = fullFaceDescriptions[i].detection.box
    //                 const text = bestMatch.toString()
    //                 const drawBox = new faceapi.draw.DrawBox(box, { label: text })
    //                 drawBox.draw(canvas)
    //             })

    //         },300);

            // console.log(displaySize)
        // }
        // detect()
        
    // });

    window.addEventListener('load', startup, false);
    })();