var slideIndex = 0;
var playing = false;
var currentTimeout;
var appSettings = null;
let shiftHolder = 0;

/**
 *
 *
 */
var settingFileName = window.location.search.split("?")[1];
let getSetting = fileName =>
    $.getJSON(fileName, function(json) {
        appSettings = json;
        if (appSettings.kiosk) {
            kioskMode();
        }
    }).fail(function() {
        console.log("setting file name error, defaulting..");
        getSetting("settings.json");
    });
getSetting(settingFileName);

// make the keystoneContainer div
$("<div/>", {
    id: "keystoneContainer"
}).appendTo("body");
// Maptastic("keystoneContainer");

//----------------------------------------------------------------------

async function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    // put slides in first div
    let keystoneContainer = document.getElementById("keystoneContainer");
    let divs = await parseFiles(files);

    keystoneContainer.innerHTML = divs.join("");

    showSlides(0);
}

// https://stackoverflow.com/questions/15960508/javascript-async-readasdataurl-multiple-files/21153118#21153118
async function parseFiles(files) {
    var video_ids = [];
    var output = [];

    for (let i = 0; i < files.length; i++) {
        //if img file ext.
        if (
            files[i].name.slice(-3) != "mov" &&
            files[i].name.slice(-3) != "MOV" &&
            files[i].name.slice(-3) != "mp4" &&
            files[i].name.slice(-3) != "mpe" &&
            files[i].name.slice(-3) != "MP4" &&
            files[i].name.slice(-3) != "avi" &&
            files[i].name.slice(-3) != "AVI"
        ) {
            output.push(
                "<div class='mySlides fade'><img src='" + +"' /></div>"
            );

            // } else {
            //     //if movie file
            //     output.push(
            //         '<div class="mySlides fade"><video controls="controls" poster="MEDIA" src="' +
            //             "/" +
            //             appSettings.media_folder +
            //             "/" +
            //             escape(f.name) +
            //             '" id="video' +
            //             i +
            //             '" height="100%" width= "100%"></video></div>'
            //     );

            //     video_id = "video" + i;
            //     video_ids.push(video_id);
            // }
        }
    }
    // array with base64 strings
    return await Promise.all(output);
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
    if (!document.getElementById("intSlide").value) {
        interval = appSettings.autoplay_interval;
    } else {
        interval = input.value;
    }
    console.log("Auto slideshow, every " + interval + " seconds.");

    var slides = document.getElementsByClassName("mySlides");

    //hide all slides divs  at start
    for (var i = 0; i < slides.length; i++) {
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

//go full screen
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
        if (keyName == appSettings.next_slide_button) {
            message.id = slideIndex;
            console.log(
                "(master) sync with slide No:" +
                    slideIndex +
                    ", ts: " +
                    Date.now()
            );
            window.document.channel.postMessage(JSON.stringify(message));
            plusSlides(-1);
        } else if (keyName == appSettings.prev_slide_button) {
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
            console.log(" [f] pressed, toggle full screen, help and UI");
            let ui = document.getElementById("ui");
            if (ui.style.display == "block") {
                ui.style.display = "none";
            } else {
                ui.style.display = "block";
            }
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

/**
 *
 * @param {*} evt
 */

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy";
}

if (window.File && window.FileReader && window.FileList && window.Blob) {
    var dropZone = document.getElementById("logo");
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("drop", handleFileSelect, false);
}

// document
//     .getElementById("files")
//     .addEventListener("change", handleFileSelect, false);
