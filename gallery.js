var slideIndex = 0;
var playing = false;
var currentTimeout;
var appSettings = null;
let shiftHolder = 0;

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

/**
 *
 * @param {*} evt
 */
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy";
    document.getElementById("logo").classList.add("fade");
    document.body.style.backgroundColor = "green";
}

/**
 *
 * @param {*} evt
 */
function handleDragLeave(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    document.getElementById("logo").classList.remove("fade");
    document.body.style.backgroundColor = "";
}

/**
 *
 * @param {*} evt
 */
async function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    document.body.style.backgroundColor = "";

    var files = evt.dataTransfer.files;
    // put slides in first div
    let keystoneContainer = document.createElement("div");
    document.body.appendChild(keystoneContainer);
    keystoneContainer.className = "keystoneContainer";
    let imgDivs = await parseFiles(files);
    imgDivs = imgDivs.join("");

    keystoneContainer.innerHTML = imgDivs;
    Maptastic(keystoneContainer);
    showSlides(0);
}

/**
 *
 * @param {
 * }
 */

// create function which return resolved promise
// with data:base64 string
function imageGetBase64(file) {
    const reader = new FileReader();
    return new Promise(resolve => {
        reader.onload = ev => {
            resolve(ev.target.result);
        };
        reader.readAsDataURL(file);
    });
}

async function parseFiles(fileList) {
    console.log(fileList);
    // here will be array of promisified functions
    const promises = [];
    // loop through fileList with for loop
    for (let i = 0; i < fileList.length; i++) {
        if (
            fileList[i].name.slice(-3) != "mov" &&
            fileList[i].name.slice(-3) != "MOV" &&
            fileList[i].name.slice(-3) != "mp4" &&
            fileList[i].name.slice(-3) != "mpe" &&
            fileList[i].name.slice(-3) != "MP4" &&
            fileList[i].name.slice(-3) != "avi" &&
            fileList[i].name.slice(-3) != "AVI"
        ) {
            let imgData = await imageGetBase64(fileList[i]);
            promises.push(
                '<div class="mySlides fade"><img src="' +
                    imgData +
                    '" height="100%" width= "100%"></div>'
            );
        } else {
            //if movie file
            let vidData = await imageGetBase64(fileList[i]);
            promises.push(
                '<div class="mySlides fade"><video controls="controls" poster="MEDIA" src="' +
                    vidData +
                    '" id="video' +
                    i +
                    '" height="100%" width= "100%"></video></div>'
            );
        }
    }
    // array with base64 strings
    return await Promise.all(promises);
}

/**
 *
 * @param {
 * }
 */

//on click go to next/prev slide
function nextSlide() {
    slideIndex++;
    showSlides(slideIndex);
}

function prevSlide() {
    slideIndex--;
    showSlides(slideIndex);
}

/**
 *
 * @param {
 * }
 */

//feed the inner div with the relevant slide content
function showSlides(n) {
    var slides = document.getElementsByClassName("mySlides");
    console.log("slide ", slideIndex, "of ", slides.length);
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    if (n == slides.length) {
        slideIndex = 0;
    } else if (n <= 0) {
        slideIndex = slides.length - 1;
    }

    if (slides[slideIndex].querySelector("video")) {
        let video = slides[slideIndex].querySelector("video");
        video.currentTime = 0;
        video.pause();
        video.onended = function() {
            let message = {};
            message.command = "restartVideo";
            showSlides(n);
        };
        video.play();
    }

    slides[slideIndex].style.display = "block";
}

/**
 *
 * @param {
 * }
 */

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
    //resert roll to 1 at end
    if (slideIndex == slides.length) {
        slideIndex = 0;
    }
    //set this slide
    let thisSlide = slides[slideIndex];
    // if video
    if (thisSlide.querySelector("video")) {
        let video = thisSlide.querySelector("video");
        video.currentTime = 0;
        video.pause();
        video.onended = function() {
            console.log("video ended! ts: " + Date.now());
            let message = {};
            message.command = "restartVideo";
            video.play();
        };
        video.play();
    }
    thisSlide.style.display = "block";
    if (playing == true) {
        currentTimeout = setTimeout(autoSlideShow, interval * 1000);
    }
}

/**
 *
 * @param {
 * }
 */

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

/**
 *
 * @param {
 * }
 */
function shiftContent(translateAmount) {
    shiftHolder = shiftHolder + translateAmount;
    let allslides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < allslides.length; i++) {
        allslides[i].style.transform = "translate(" + shiftHolder + "%, 0)";
    }
}

/**
 *
 * @param {
 * }
 */

let cropHolder = 100;
function slideDivCrop(cropAmount) {
    cropHolder = cropAmount + cropHolder;
    console.log(cropHolder);

    let allslides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < allslides.length; i++) {
        allslides[i].style.width = cropHolder + "%";
    }
}

/**
 *
 * @param {
 * }
 */

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

/**
 *
 * @param {
 * }
 */

// INTERACTION

//interaction
document.body.addEventListener(
    "keydown",
    event => {
        const keyName = event.key;
        const keyCode = event.keyCode;

        if (keyName == appSettings.next_slide_button) {
            prevSlide();
        } else if (keyName == appSettings.prev_slide_button) {
            nextSlide();
        } else if (keyCode == 70) {
            toggleFullScreen();
            let ui = document.getElementById("logo");
            if (ui.style.display !== "none") {
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

if (window.File && window.FileReader && window.FileList && window.Blob) {
    var dropZone = document.getElementById("logo");
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("dragleave", handleDragLeave, false);
    dropZone.addEventListener("drop", handleFileSelect, false);
}
