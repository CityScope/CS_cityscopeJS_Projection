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

function handleDragOver(evt) {
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
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("drop", handleFileSelect, false);
}
