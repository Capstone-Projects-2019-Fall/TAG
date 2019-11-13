// hide flags
$('#text-type').on('change', function () {
    if ($(this).val() == 'regex') {
        $("#regex-flags").show();
    } else {
        $("#regex-flags").hide();
    }
});

// Searching using the search button
$("#search-button").on("click", function () {
    searchForText();
});

$("#search-box").on("keypress", function (e) {
    if (e.which === 13) {
        if (!$(this).val()) {
            return;
        }
        searchForText();
    }
});

function searchForText() {
    // check document is made
    if (tagModel.currentDoc === null) {
        alert('Error: Please select add a document first');
        return
    }

    // check label is made
    if (tagModel.currentCategory === null) {
        alert('Error: Please add a category first');
        return;
    }

    // Get the text the user is searching for
    var searching = document.getElementById("search-box").value;
    if (searching == "" || searching.trim() == "") {
        alert("Please enter the text you want to highlight");
        return;
    }

    // Get flags selected from dropdown;
    var flags = "g";
    $("input[name='flag']:checked").each(function () {
        flags += $(this).val();
    });

    // build regex expression
    let regex = null;
    if ($("#text-type").children("option:selected").val() === "plain-text") {
        regex = new RegExp("\\b" + regexEscape(searching) + "\\b", 'g');
    } else {
        regex = new RegExp(searching, flags);
    }

    // add annotation
    if ($("#search-type").children("option:selected").val() === "add") {
        console.log("Searching to highlight");

        //Get the contents of the entire document
        var text = tagModel.currentDoc.text;

        //Get the annotations of the current document
        while (match = regex.exec(text)) {
            // ignore empty
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
                continue;
            }
            if (match[0].trim() === '') {
                continue;
            }

            // not empty
            let range = {
                'startPosition': match.index,
                'endPosition': match.index + match[0].length
            };
            console.log('Found "' + match[0] + '"\nStart position: ' + range.startPosition + "\nEnd Position: " + range.endPosition);
            tagModel.addAnnotation(range, tagModel.currentCategory);
        }
    }
    // remove annotation
    else {
        console.log("Searching to delete.");
        //Get the annotations of the current document
        tagModel.currentDoc.annotations.forEach(function (annotation) {
            if (annotation.content.match(regex)) {
                console.log("Found '" + annotation.content + "'\nStart Position: " + annotation.range.startPosition + "\nEnd Position: " + annotation.range.endPosition);
                tagModel.removeAnnotation(annotation);
            }
        });
        mostRecentIndex = -1;
    }
    renderHighlights();
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};