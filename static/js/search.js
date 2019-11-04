// Searching using the search button
$("#search-button").on("click", function(){
    // Get the text the user is searching for
    if($("#search-type").children("option:selected").val() === "add") {
        console.log("Searching to highlight");
        // Get the text the user is searching for
        var searching = document.getElementById("search-box").value;
        if (tagModel.currentCategory === null) {
            alert('Error: Please select a category first');
            return;
        } else if (searching == "" || searching.trim() == ""){
            alert("Please enter the text you want to highlight");
            return;
        } else {
            // Get flags selected from dropdown;
            var flags = [];
            $.each($("input[name='flag']:checked"), function(){
                flags.push($(this).val());
            });
            console.log("Flags: " + flags.join(''));

            var regex = new RegExp("\\b" + searching + "\\b", flags.join(''));
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
    } else if ($("#search-type").children("option:selected").val() === "delete") {
        console.log("Searching to delete.");
        var searching = document.getElementById("search-box").value;
        if (tagModel.currentCategory === null) {
            alert('Error: Please select a category first');
            return;
        } else if (searching == "" || searching.trim() == ""){
            alert("Please enter the text you want to highlight");
            return;
        } else {
            var regex = new RegExp("\\b" + searching, 'g');
            console.log("Searching for " + searching + " in document"); 

            //Get the contents of the entire document
            tagModel.currentDoc.annotations.forEach( function(annotation){
                if(annotation.content.match(regex)){
                    console.log("Found " + annotation.content + "\nStart postion: " + position + "\nEnd Position: " + (position + annotation.content.length));
                    tagModel.removeAnnotation(annotation);
                }
                position += annotation.content.length+1; // the plus 1 accounts for the space at the end
            })
            renderTextareaHighlights();
        }
    }
});

$("#search-box").on("keypress", function(e){
    if(e.which === 13){
        if(!$(this).val()){
            return;
        }
        if($("#search-type").children("option:selected").val() === "add") {
            console.log("Searching to highlight");
            // Get the text the user is searching for
            var searching = document.getElementById("search-box").value;
            if (tagModel.currentCategory === null) {
                alert('Error: Please select a category first');
                return;
            } else if (searching == "" || searching.trim() == ""){
                alert("Please enter the text you want to highlight");
                return;
            } else {
                // Get flags selected from dropdown;
                var flags = [];
                $.each($("input[name='flag']:checked"), function(){
                    flags.push($(this).val());
                });
                console.log("Flags: " + flags.join(''));
    
                var regex = new RegExp("\\b" + searching + "\\b", flags.join(''));
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
        } else if ($("#search-type").children("option:selected").val() === "delete") {
            console.log("Searching to delete.");
            var searching = document.getElementById("search-box").value;
            if (tagModel.currentCategory === null) {
                alert('Error: Please select a category first');
                return;
            } else if (searching == "" || searching.trim() == ""){
                alert("Please enter the text you want to highlight");
                return;
            } else {
                var regex = new RegExp("\\b" + searching, 'g');
                console.log("Searching for " + searching + " in document"); 
    
                //Get the annotations of the current document
                
                tagModel.currentDoc.annotations.forEach( function(annotation){
                    if(annotation.content.match(regex)){
                        console.log("Found " + annotation.content + "\nStart postion: " + position + "\nEnd Position: " + (position + annotation.content.length));
                        tagModel.removeAnnotation(annotation);
                    }
                    position += annotation.content.length+1; // the plus 1 accounts for the space at the end
                })
                renderTextareaHighlights();
            }
        }
    } 
});


