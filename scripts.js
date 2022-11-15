const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

            //below we are converting the localMediaStream to a url. It can then live stream to the video element.

function getVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((MediaStream) => {
            console.log(MediaStream);
            video.srcObject = MediaStream;
            video.play();
        })
    .catch(err => {
        console.error(`Bollocks!`, err);
    });
}
// We're now going to take a frame from the video and paint it to the canvas. We start by taking the width and height of the video. We then draw the image from the video to the canvas. 

// We then take the pixels out of the canvas and put them into an array.We then mess with the pixels and put them back into the canvas.We then take the data out of the canvas and put it into a link.We then download the image.
function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    // here we're setting the width and height of the canvas to be the same as the video
    canvas.width = width;
    canvas.height = height;

    // we'll return the setInterval so that we can stop it from running later.
    // set interval runs a function every 16ms. This is the same as 60fps. drawImage takes an image and paints it to the canvas.
    // by console.logging the pixels and running debugger, we can see that the pixels are an array of numbers. Each number represents the red, green, blue and alpha values of a pixel.
    return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height);
        // console.log(pixels);
        // debugger;
        // pixels = redEffect(pixels);
        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.1;
        pixels = greenScreen(pixels);

        ctx.putImageData(pixels, 0, 0);
        

    }, 16);
}

function takePhoto() {
    snap.currentTime = 0;
    snap.play();
    // We'll now take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg');
    // console.logging the data will give us a base64 string. This is a long string of characters that represents the image.
    // the link will be a download link. We'll create an anchor tag and set the href to the data.
    // the strip.insertBefore() method will insert the link before the first child of the strip. strip.firstChild will give us the first child of the strip. It's like JQuery's prepend method. 
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
    strip.insertBefore(link, strip.firstChild);
}
// the last step is to add some filters to the video. We're going to add filters by getting the pixels out of the canvas, mess with them, and then put them back in. We'll use the red effect filter as an example.

// here we'll loop over the pixels and make em all red. pixels.data is an array of numbers. pixel.data is nothing. 
function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100; // red
        pixels.data[i + 1] = pixels.data[i + 1] - 50; // green
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue
    }
    return pixels;
}

// here we're pulling apart the rgb values and then putting them back together in a different order. 
function rgbSplit(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i + 0]; // red
        pixels.data[i + 500] = pixels.data[i + 1]; // green
        pixels.data[i - 550] = pixels.data[i + 2]; // blue
    }
    return pixels;
}
// greenscreen works by taking all the colours between an rgb value and then making them transparent (taking them out).
// the levels object will hold the minimum and maximum values for red, green and blue. We take all the rgb inputs and set them to the levels object. The for loop will loop over the pixels and check if the rgb values are between the min and max values. If they are, we'll set the alpha value to 0. If they're not, we'll leave the alpha value as it is. The 4th pixel is alpha and if we set it to 0, it will be transparent.
function greenScreen(pixels) {
    const levels = {};

    [...document.querySelectorAll('.rgb input')].forEach((input) => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (
            red >= levels.rmin &&
            green >= levels.gmin &&
            blue >= levels.bmin &&
            red <= levels.rmax &&
            green <= levels.gmax &&
            blue <= levels.bmax
        ) {
            // take it out!
            pixels.data[i + 3] = 0;
        }
    }
    return pixels;
}


getVideo();
// the following negates the need to paint the video to the canvas in devtools every time we refresh the page.
video.addEventListener('canplay', paintToCanvas);