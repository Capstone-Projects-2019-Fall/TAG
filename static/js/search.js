// Toggle Regex button to inactive if Plain Text is selected
$("#plain-text").on("click", function(){
    $("#plain-text").attr("aria-pressed", "true")
    $("#regex").attr("aria-pressed", "false")
    console.log("Selected plain text search")
});

// Toggle Plain text button to inactive if Regex is selected
$("#regex").on("click", function(){
    $("#regex").attr("aria-pressed", "true")
    $("#plain-text").attr("aria-pressed", "false")
    console.log("Selected regex search")
});

$("#search-button").on("click", function(){
    var searching = document.getElementById("search-box").value;
    console.log("Searching for " + searching + " in document");
});