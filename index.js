function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; (f = files[i]); i++) {
        console.log(f);

        output.push(
            "<li><strong>",
            escape(f.name),
            "</strong> (",
            f.type || "n/a",
            ") - ",
            f.size,
            " bytes, last modified: ",
            f.lastModifiedDate
                ? f.lastModifiedDate.toLocaleDateString()
                : "n/a",
            "</li>"
        );
    }
    document.getElementById("list").innerHTML =
        "<ul>" + output.join("") + "</ul>";

    kioskMode(f.name);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById("drop_zone");
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", handleFileSelect, false);

/**
 *
 *
 */
kioskMode = files => {
    let arr = [];
    console.log(files);

    files.forEach(mediaFile => {
        console.log(mediaFile);

        let ext = mediaFile.slice(-3);
        if (
            ext != "mov" &&
            ext != "MOV" &&
            ext != "mp4" &&
            ext != "mpe" &&
            ext != "MP4" &&
            ext != "avi" &&
            ext != "AVI"
        ) {
            arr.push(
                '<div class=" mySlides fade" ><img src="' +
                    mediaFile +
                    '" height=" 100%" width= "100%" ></div>'
            );
        } else {
            arr.push(
                '<div class="mySlides fade">\
            <video controls="controls"\
             poster="MEDIA" src="' +
                    "/" +
                    mediaFile +
                    '" id="' +
                    mediaFile +
                    '" height="100%" width= "100%" \
                muted="muted"></video></div>'
            );
        }
    });

    document.getElementById("keystoneContainer").innerHTML = arr.join("");
    autoSlideShow();
};

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
        currentTimeout = setTimeout(autoSlideShow, interval * 1000);
    }
}
