$('#dlContainer').hide();

$('#downloadBtn').on('click', function () {
    $('#dlContainer').slideToggle(300);
});

$(document).on('click', function (e) {
    if (!$(e.target).is('#downloadBtn')) {
        $('#dlContainer').slideUp(300);
    }
});