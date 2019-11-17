var timer;
$('#rightContainer').on('click', function () {
    $(this).css('right', 0);
}).on('mouseenter', function () {
    var that = this;
    timer = setTimeout(function () {
        $(that).css('right', 0);
        clearTimeout(timer);
    }, 600);
}).on('mouseleave', function () {
    clearTimeout(timer);
});

$(document).on('click', function (e) {
    if (!$(e.target).is('#rightContainer') && !$('#rightContainer').has(e.target).length && !$('#delete-menu').has(e.target).length) {
        $('#rightContainer').css('right', '-28%');
    }
});

$('#anno-list').on('click', '.annoHeader', function () {
    $(this).next('ul').slideToggle(200);
    $(this).children('.dropArrow').toggleClass('upsideDown');
    
    // is closed // open
    if ($(this).attr('value').charAt(0) === '-') {
        $(this).attr('value', $(this).attr('value', ).slice(1));
        $(this).css('background-color', '');
        $(this).css('color', 'white');
        $(this).children('.dropArrow').css('content', 'url("/static/images/arrowDownWhite.png")');
    } 
    // is opened // close
    else {
        $(this).css('background-color', $(this).attr('value'));
        $(this).attr('value', '-' + $(this).attr('value'));
        $(this).css('color', 'black');
        $(this).children('.dropArrow').css('content', 'url("/static/images/arrowDownBlack.png")');
    }
});

$('#anno-list').on('contextmenu', '.annotation', function (e) {
    event.preventDefault();
    delete_menu.append(
        $('<li/>', {
            class: 'delete-anno-list',
            html: '<b>Delete</b>',
            value: $(this).val()
        })
    ).show(100).
        css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        });
})

$('#recent').on('contextmenu', function(e) {
    event.preventDefault();
    delete_menu.append(
        $('<li/>', {
            class: 'delete-anno-list',
            html: '<b>Delete</b>',
            value: $(this).val()
        })
    ).show(100).
        css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        });
});