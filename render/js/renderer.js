const form = document.querySelector('#img-form')
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height")
const widthInput = document.querySelector("#width");
const percentInput = document.querySelector("#percentage")

// percentInput.addEventListener("keypress", () => {
//     let inputValue = percentInput.value;
//     if(inputValue) {
//         if (inputValue.slice(-1) === '%') {
//             inputValue = inputValue
//         }}

//     let newValue = `${inputValue}%`;
//     percentInput.value = newValue;
// })

function loadImage(e) {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertErr('Please select an image file');
        return
    }


    //orig destination
    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = function () {
        widthInput.value = this.width
        heightInput.value = this.height
        percentInput.value = this.percent;
    }

    form.style.display = 'block'
    filename.innerText = file.name
    outputPath.innerText = path.join(os.homedir(), 'imageresizer')
}


//send image to main
function sendImage(e) {
    e.preventDefault()


    const percent = percentInput.value / 100
    const width = widthInput.value * percent;
    const height = heightInput.value * percent;
    const imgPath = img.files[0].path


    if(!img.files[0]) {
        alertErr('Please upload an image')
        return
    }

    if(percent === true) {
        return width * percent && height * percent
    }

    if(width === '' || height === '') {
        alertErr('Please fill in the size values')
        return
    }

    //send to main using ipcRenderer
    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height,
        percent
    })}



//catch the prompt event
ipcRenderer.on("image:done", () => {
     if (!percentInput.value) {
       alertSucc(`Image resized to ${widthInput.value} x ${heightInput.value}`);
     } else {
       alertSucc(`Image resized to ${percentInput.value}%`);
     }
});

//Image file check
function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg' ]
    return file && acceptedImageTypes.includes(file['type'])
}

 function alertErr(message) {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            backgroundColor:'red',
            color: 'white',
            textAlign: 'center'
        }
    })
 }
    function alertSucc(message) {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            backgroundColor:'green',
            color: 'white',
            textAlign: 'center'
        }
    })
 }

img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)