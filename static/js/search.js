// Toggle Regex button to inactive if Plain Text is selected
$("#plain-text").on("click", function(){
    $("#regex").attr("class", "btn btn-mdb-color")
    console.log("Selected plain text search")
})

// Toggle Plain text button to inactive if Regex is selected
$("#regex").on("click", function(){
    $("#plain-text").attr("class", "btn btn-mdb-color")
    console.log("Selected regex search")
})