// https://codepen.io/SpencerCooley/pen/JtiFL/

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; (f = files[i]); i++) {
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

        renderImage(f);
    }
}

//this function is called when the input loads an image
function renderImage(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        the_url = event.target.result;
        let previewDiv = document.getElementById("drop_zone");
        previewDiv.innerHTML = "<img src='" + the_url + "' />";
        Maptastic(previewDiv);
    };

    //when the file is read it triggers the onload event above.
    reader.readAsDataURL(file);
}

function handleDragENTER(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
}

//check if browser supports file api and filereader features
if (window.File && window.FileReader && window.FileList && window.Blob) {
    //this is not completely neccesary, just a nice function I found to make the file size format friendlier
    //http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable

    // Setup the dnd listeners.
    var dropZone = document.getElementById("drop_zone");
    dropZone.addEventListener("dragover", handleDragENTER, false);
    dropZone.addEventListener("drop", handleFileSelect, false);
}

var settingFileName = window.location.search.split("?")[1];
console.log("settings File Name:", settingFileName);
let getSetting = fileName =>
    $.getJSON(fileName, function(json) {
        appSettings = json;
        if (appSettings.kiosk) {
            kioskMode();
        }
    }).fail(function() {
        console.log("setting file name error...");
        getSetting("settings.json");
    });
getSetting(settingFileName);

/**
 * auto run on init given settings
 * ONLY VIDEOS FOR NOW
 */

kioskMode = () => {
    let arr = [];
    appSettings.output.forEach(mediaFile => {
        //if img file ext.
        if (
            mediaFile.slice(-3) != "mov" &&
            mediaFile.slice(-3) != "MOV" &&
            mediaFile.slice(-3) != "mp4" &&
            mediaFile.slice(-3) != "mpe" &&
            mediaFile.slice(-3) != "MP4" &&
            mediaFile.slice(-3) != "avi" &&
            mediaFile.slice(-3) != "AVI"
        ) {
            arr.push(
                '<div class=" mySlides fade" ><img src="' +
                    "/" +
                    appSettings.media_folder +
                    "/" +
                    mediaFile +
                    '" height=" 100%" width= "100%" ></div>'
            );
        } else {
            arr.push(
                '<div class="mySlides fade">\
            <video controls="controls"\
             poster="MEDIA" src="' +
                    "/" +
                    appSettings.media_folder +
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
    togglePlayPause();

    let ui = document.getElementById("ui");
    if (ui.style.display == "block") {
        ui.style.display = "none";
    }
};

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
