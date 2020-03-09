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
