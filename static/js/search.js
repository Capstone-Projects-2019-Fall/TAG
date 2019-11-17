var send = $('#searchSend');
$("#regexFlags").hide();
$("#flags").hide();

// toggle text-regex
$('#textType').on('click', function () {
    if ($(this).val() === 'regex') {
        $('#regexFlags').animate({width: 'toggle'}, 200);
        $('#searchEntry').animate({width: '90%'}, 200);
        $(this).val('text');
        $(this).children('div').fadeOut(200, function() {
            $(this).text('txt');
        }).fadeIn(100);
    } else {
        $('#regexFlags').animate({width: 'toggle'}, 200);;
        $('#searchEntry').animate({width: '80%'}, 200);
        $(this).val('regex');
        $(this).children('div').fadeOut(200, function() {
            $(this).text('re');
        }).fadeIn(100);
    }
});

// toggle add-delete
$('#searchToggle').on('click', function () {
    if (send.val() === 'add') {
        $(this).children('div').fadeOut(200, function() {
            $(this).text('<');
        }).fadeIn(100);
        send.val('delete');
        send.children('div').fadeOut(200, function() {
            $(this).text('delete')
        }).fadeIn(100);
    } else {
        $(this).children('div').fadeOut(200, function() {
            $(this).text('>');
        }).fadeIn(100);
        send.val('add');
        send.children('div').fadeOut(200, function() {
            $(this).text('add')
        }).fadeIn(100);
    }
});

$('#regexFlags').on('click', function() {
    $("#flags").slideToggle(300);
});

$(document).on('click', function(e) {
    if (!$(e.target).is('#regexFlags') && !$(e.target).is('#flagIcon') && !$(e.target).is('#flags') && !$('#flags').has(e.target).length) {
        $('#flags').slideUp(300);
    }
});

// Searching using the search button
send.on("click", function () {
    searchForText();
});

$("#searchEntry").on("keypress", function (e) {
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
    var searchString = $("#searchEntry").val();
    $("#searchEntry").val("");
    if (searchString == "" || searchString.trim() == "") {
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
    if ($("#textType").val() === "regex") {
        regex = new RegExp(searchString, flags);
    } else {
        regex = new RegExp("\\b" + regexEscape(searchString) + "\\b", 'g');
    }

    // add annotation
    if (send.val() === "add") {
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