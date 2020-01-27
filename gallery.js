var slideIndex = 0;
var playing = false;
var currentTimeout;
var folderName = "media/";

// make the keystoneContainer div
$("<div/>", {
    id: "keystoneContainer"
}).appendTo("body");
Maptastic("keystoneContainer");

//----------------------------------------------------------------------
// TODO: hide chanel variable once it is working
window.document.channel = new BroadcastChannel("channel");
window.document.channel.onmessage = function(m) {
    let data = JSON.parse(m.data);

    switch (data.command) {
        case "sync":
            console.log(
                "sync with slide No:" + slideIndex + ", ts: " + Date.now()
            );
            slideIndex = data.id;
            showSlides(slideIndex);
            break;
        case "restartVideo":
            console.log("forcing video to position 0 and restart");
            showSlides(slideIndex);
            break;
        default:
            console.log("undefined command:" + data.command);
    }
};

const sendContianer = document.querySelector("#send");
sendContianer.addEventListener("click", () => {
    let incMessage = {};
    incMessage.command = "increment";
    window.document.channel.postMessage(JSON.stringify(incMessage));
});

//----------------------------------------------------------------------

function handleFileSelect(evt) {
    // FileList object
    var files = evt.target.files;
    console.log(files);

    // files is a FileList of File objects. List some properties.
    var output = [];
    var video_ids = [];
    //loop through slected files
    for (var i = 0, f; (f = files[i]); i++) {
        //if img file ext.
        if (
            f.name.slice(-3) != "mov" &&
            f.name.slice(-3) != "MOV" &&
            f.name.slice(-3) != "mp4" &&
            f.name.slice(-3) != "mpe" &&
            f.name.slice(-3) != "MP4" &&
            f.name.slice(-3) != "avi" &&
            f.name.slice(-3) != "AVI"
        ) {
            output.push(
                '<div class=" mySlides fade" ><img src="' +
                    folderName +
                    escape(f.name) +
                    '" height=" 100%" width= "100%" ></div>'
            );
        } else {
            //if movie file
            output.push(
                '<div class="mySlides fade"><video controls="controls" poster="MEDIA" src="' +
                    folderName +
                    escape(f.name) +
                    '" id="video' +
                    i +
                    '" height="100%" width= "100%"></video></div>'
            );

            video_id = "video" + i;
            video_ids.push(video_id);
        }
    }
    // put slides in first div
    document.getElementById("keystoneContainer").innerHTML = output.join("");

    showSlides(0);
}

//----------------------------------------------------------------------

//on click go to next/prev slide
function plusSlides(n) {
    showSlides((slideIndex += n));
}

//----------------------------------------------------------------------

//feed the inner div with the relevant slide content
function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");

    //hide all slides divs at start
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    //resert roll to 1 at end
    if (slides.length > 0 && n == slides.length) {
        slideIndex = 0;
    }
    // //avoid slide zero
    if (n < 0 && slides.length > 0) {
        slideIndex = slides.length - 1;
    }
    //set this slide
    thisSlide = slides[slideIndex];

    if (thisSlide.querySelector("video")) {
        let video = thisSlide.querySelector("video");

        video.currentTime = 0;
        video.pause();
        video.onended = function() {
            console.log("video ended! ts: " + Date.now());
            let message = {};
            message.command = "restartVideo";
            window.document.channel.postMessage(JSON.stringify(message));
            showSlides(n); // which plays again
        };
        video.play();
    }
    thisSlide.style.display = "block";
}

//----------------------------------------------------------------------

//autoplay when press P
function autoSlideShow() {
    let interval;
    input = document.getElementById("intSlide");

    if (!input.value) {
        interval = input.placeholder;
    } else {
        interval = input.value;
    }

    console.log("Auto slideshow, every " + interval + " seconds.");
    var i;
    var slides = document.getElementsByClassName("mySlides");
    //hide all slides divs  at start
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;
    let message = {};
    message.command = "sync";
    message.id = slideIndex;
    window.document.channel.postMessage(JSON.stringify(message));

    //resert roll to 1 at end
    if (slideIndex == slides.length) {
        slideIndex = 0;
    }
    //set this slide
    thisSlide = slides[slideIndex];

    // if video
    if (thisSlide.querySelector("video")) {
        let video = thisSlide.querySelector("video");

        video.currentTime = 0;
        video.pause();
        video.onended = function() {
            console.log("video ended! ts: " + Date.now());
            let message = {};
            message.command = "restartVideo";
            window.document.channel.postMessage(JSON.stringify(message));
            video.play();
        };
        video.play();
    }
    thisSlide.style.display = "block";

    if (playing == true) {
        currentTimeout = setTimeout(autoSlideShow, interval * 1000); // Change image every x miliseconds
    }
}

//----------------------------------------------------------------------

function togglePlayPause() {
    if (playing == true) {
        playing = false;
        clearTimeout(currentTimeout);
    } else {
        //play slide show
        playing = true;
        autoSlideShow();
    }
}

//----------------------------------------------------------------------
let shiftHolder = 0;
function shiftContent(translateAmount) {
    shiftHolder = shiftHolder + translateAmount;
    let allslides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < allslides.length; i++) {
        allslides[i].style.transform = "translate(" + shiftHolder + "%, 0)";
    }
}

//----------------------------------------------------------------------

let cropHolder = 100;
function slideDivCrop(cropAmount) {
    cropHolder = cropAmount + cropHolder;
    console.log(cropHolder);

    let allslides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < allslides.length; i++) {
        allslides[i].style.width = cropHolder + "%";
    }
}

//----------------------------------------------------------------------

//full screen when '`/~' is pressed
function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
    var requestFullScreen =
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullScreen ||
        docEl.msRequestFullscreen;
    var cancelFullScreen =
        doc.exitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen;

    if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement
    ) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
}

//----------------------------------------------------------------------

function makeIframe() {
    var url = document.getElementById("inputTxt").value;
    console.log(url);

    var iframe = "";
    if (document.getElementById("iframe") == null) {
        iframe = document.createElement("iframe");
        document.body.appendChild(iframe);
    } else {
        iframe = document.getElementById("iframe");
    }
    console.log(iframe);

    if (url == "URL" || url == "") {
        //default to table test for cityscopeJS
        iframe.src = "https://cityscope.media.mit.edu/";
    } else {
        iframe.src = url;
    }
    Maptastic(iframe);
}

//----------------------------------------------------------------------

function cityIO() {
    var localStorageKey = "maptastic.layers";
    if (localStorage.getItem(localStorageKey)) {
        var data = JSON.parse(localStorage.getItem(localStorageKey));
        //send to cityIO
        fetch("https://cityio.media.mit.edu/api/table/update/prjmapJS", {
            method: "POST",
            body: data[0]
        }).then(response => {
            console.log(response);
        });
    }
}

//----------------------------------------------------------------------

// INTERACTION

//interaction
document.body.addEventListener(
    "keydown",
    event => {
        const keyName = event.key;
        const keyCode = event.keyCode;
        let message = {};
        message.command = "sync";
        //change slides and send to channel
        if (keyName == "ArrowLeft") {
            message.id = slideIndex;
            console.log(
                "(master) sync with slide No:" +
                    slideIndex +
                    ", ts: " +
                    Date.now()
            );
            window.document.channel.postMessage(JSON.stringify(message));
            plusSlides(-1);
        } else if (keyName == "ArrowRight" || keyName == "b") {
            message.id = slideIndex;
            console.log(
                "(master) sync with slide No:" +
                    slideIndex +
                    ", ts: " +
                    Date.now()
            );
            window.document.channel.postMessage(JSON.stringify(message));
            plusSlides(1);
        } else if (keyCode == 70) {
            toggleFullScreen();
            // if (evtobj.keyCode == 72 && evtobj.ctrlKey) {
            console.log(" [f] pressed, toggle full screen, help and UI");
            let ui = document.getElementById("ui");
            if (ui.style.display == "block") {
                ui.style.display = "none";
            } else {
                ui.style.display = "block";
            }
            // } else
        } else if (keyName == "P") {
            togglePlayPause();
        } else if (keyName == "-") {
            shiftContent(-10);
        } else if (keyName == "=") {
            shiftContent(10);
        } else if (keyName == "[") {
            slideDivCrop(-5);
        } else if (keyName == "]") {
            slideDivCrop(5);
        } else if (keyName == "S") {
            cityIO();
        }
    },
    false
);

// key combiations
document.onkeydown = KeyPress;
function KeyPress(e) {
    var evtobj = window.event ? event : e;
    if (evtobj.keyCode == 68 && evtobj.ctrlKey) {
        alert("Ctrl+d pressed, clearing local storage");
        localStorage.clear();
        location.reload();
    }
}

//loading files
document
    .getElementById("files")
    .addEventListener("change", handleFileSelect, false);
