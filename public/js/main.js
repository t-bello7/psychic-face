
const registerForm = document.querySelector('.register');
registerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const formData = new FormData(registerForm);
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
    


        // function clearPhoto(){
        //     let photocontext = canvas.getContext('2d');
        //     photocontext.fillStyle = "#AAA";
        //     photocontext.fillRect(0,0, canvas.width, canvas.height);
            
        //     let data = canvas.toDataURL('image/png');
        //     photo.setAttribute('src', data);
        // }
        // function takepicture(){
        //     let photocontext = canvas.getContext('2d');
        //     if (width && height){
        //         canvas.width = width;
        //         canvas.height = height;
        //         photocontext.drawImage(video, 0, 0, width, height);
        //         let data = canvas.toDataURL('image/png');
        //         let data64 = data.replace('data:image/png;base64,', '');
        //         photo.setAttribute('src', data);
        //         }
        //         else {
        //         clearPhoto();
        //     }
        
        // }