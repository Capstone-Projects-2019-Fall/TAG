var timer;
$('#rightContainer').on('click', function () {
    $(this).css('right', 0);
}).on('mouseenter', function () {
    var that = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
        $(that).css('right', 0);
        clearTimeout(timer);
    }, 500);
}).on('mouseleave', function () {
    var that = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
        $(that).css('right', '-28%');
        clearTimeout(timer);
    }, 500);
});

$(document).on('click', function (e) {
    if (!$(e.target).is('#rightContainer') && !$('#rightContainer').has(e.target).length) {
        $('#rightContainer').css('right', '-28%');
    }
});