// Searching using the search button
$("#search-button").on("click", function(){
    // Get the text the user is searching for
    var searching = document.getElementById("search-box").value;
    var regex = new RegExp(searching, 'g');
    console.log("Searching for " + searching + " in document");

    //Get the contents of the entire document
    var text = document.getElementById("doc-view").value;
    // Split text into tokens
    var token = text.split(/\s/);

    //Current position in the document
    var position = 0;
      
    token.forEach( function(word){
        if(word.match(regex)){
            console.log("Found " + word + "\nStart postion: " + position + "\nEnd Position: " + (position + word.length));
            let range = {
                'startPosition': position,
                'endPosition': position + word.length
              };
            let annotationCreated = tagModel.addAnnotation(range, tagModel.currentCategory);
            console.log("Highlighted: " + range.startPosition + "-" + range.endPosition);
            $('#recent').text(annotationCreated.content.trunc(50, true));
            addToList(annotationCreated.content);
        }
        position += word.length+1; // the plus 1 accounts for the space at the end
    })
    renderTextareaHighlights();
});

$("#search-box").on("keypress", function(e){
    if(e.which === 13){
        if(!$(this).val()){
            return;
        }
        // Get the text the user is searching for
        var searching = document.getElementById("search-box").value;
        var regex = new RegExp(searching, 'g');
        console.log("Searching for " + searching + " in document");

        //Get the contents of the entire document
        var text = document.getElementById("doc-view").value;
        // Split text into tokens
        var token = text.split(/\s/);

        //Current position in the document
        var position = 0;
      
        token.forEach( function(word){
            if(word.match(regex)){
                console.log("Found " + word + "\nStart postion: " + position + "\nEnd Position: " + (position + word.length));
                let range = {
                    'startPosition': position,
                    'endPosition': position + word.length
                };
                let annotationCreated = tagModel.addAnnotation(range, tagModel.currentCategory);
                console.log("Highlighted: " + range.startPosition + "-" + range.endPosition);
                $('#recent').text(annotationCreated.content.trunc(50, true));
                addToList(annotationCreated.content);
            }
            position += word.length+1; // the plus 1 accounts for the space at the end
        })
        renderTextareaHighlights();
    } 
});