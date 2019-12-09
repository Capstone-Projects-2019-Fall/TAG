$('#rightArrow').hide();
var timer;

$('#rightContainer').on('click', function (e) {
    // check if clicked annotation header
    if (!$(e.target).is('.annoHeader')) {
        $(this).css('right', 0);
        clearTimeout(timer);
    }
})
// mouse is hovered over right area
.on('mouseenter', function () {
    $('#rightArrow').fadeIn(100);
    var that = this;
    // mouse hovered over for 500ms
    timer = setTimeout(function () {
        $(that).css('right', 0);
        clearTimeout(timer);
        $('#rightArrow').addClass('noDisplay');
    }, 500);
})
// mouse left before time elapsed
.on('mouseleave', function () {
    // mouse left right area
    $('#rightArrow').fadeOut(100);
    // reset timer
    clearTimeout(timer);
});

// click outside and hide right panel
$(document).on('click', function (e) {
    // check if clicked right outside of right panel (or child) but not delete button
    if (!$(e.target).is('#rightContainer') && !$('#rightContainer').has(e.target).length && !$('#delete-menu').has(e.target).length) {
        // hide
        $('#rightContainer').css('right', '-28%');
        $('#rightArrow').removeClass('noDisplay');
        //hide console
        $('#consoleContainer').css('height', ' 1vh');
        consoleShown = false;
        $('#consoleArrow').addClass('upsideDown');
    }
});

// clicked annotation header // hide list of annotations for category
$('#anno-list').on('click', '.annoHeader', function () {
    $(this).next('ul').slideToggle(200);
    $(this).children('.dropArrow').toggleClass('upsideDown');

    // aesthetics 
    // is closed // open
    if ($(this).attr('value').charAt(0) === '-') {
        $(this).attr('value', $(this).attr('value').slice(1));
        hiddenAnno_list.splice(hiddenAnno_list.indexOf($(this).next('ul').attr('value')), 1);
        $(this).css('background-color', '');
        $(this).css('color', 'white');
        $(this).children('.dropArrow').css('content', 'url("/static/images/arrowDownWhite.png")');
    } 
    // is opened // close
    else {
        if (hiddenAnno_list.indexOf($(this).next('ul').attr('value')) === -1) {
            hiddenAnno_list.push($(this).next('ul').attr('value'));
        }
        $(this).css('background-color', $(this).attr('value'));
        $(this).attr('value', '-' + $(this).attr('value'));
        $(this).css('color', 'black');
        $(this).children('.dropArrow').css('content', 'url("/static/images/arrowDownBlack.png")');
    }
});

// right clicked annotation // bring up delete prompt
$('#anno-list').on('contextmenu', '.annotation', function (e) {
    e.preventDefault();
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

// right clicked most recent annotation // bring up delete prompt
$('#recent').on('contextmenu', function (e) {
    e.preventDefault();
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