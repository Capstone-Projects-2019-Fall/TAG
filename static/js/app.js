//jshint esversion:6

/* ---------- page setup ---------- */
var tagModel = new TagModel();
var textArea = $('#doc-view');
var highlightArea = $('#highlightArea');
var label_list = $("#label-list");
var delete_menu = $('#delete-menu');
var doc_list = $('#doc-list');
var deleteList = [];
var mostRecentIndex = -1;
// --------------events-------------- //

// clicked anywhere
$(document).on("mousedown", function (e) {
  // If the clicked element is not the menu
  if ($(e.target).parents("#delete-menu").length === 0) {
    // Hide it
    delete_menu.hide(100);
    delete_menu.text('');
  }
});

// download Zip
$('#dlZip').on('click', function () {
  console.log("Zip download requested...");
  // no files found
  if (tagModel.openDocs.length === 0) {
    alert('Error: No data to download!');
    return;
  }
  let zip = tagModel.getAsZip();
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "annotations.zip");
  });
});

// download Json
$('#dlJson').on('click', function () {
  console.log("JSON download requested...");
  // no files found
  if (tagModel.openDocs.length === 0) {
    alert('Error: No data to download!');
    return;
  }
  var blob = new Blob([tagModel.exportAsString()], { type: 'application/JSON' });
  saveAs(blob, "annotations.json");
});

// send to mldata
$('#sendML').on('click', function () {
  // no files found
  if (tagModel.openDocs.length === 0) {
    alert('Error: No data to send!');
    return;
  }
  // prepare data

  var blob = new Blob([tagModel.exportAsString()], { type: 'application/JSON' });
  var formData = new FormData();
  console.log("Sending data to ML");

  formData.append("jsonUpload", blob);
  formData.append("save-model", $("#save-model").is(':checked'));
  formData.append("load-model", $("#load-model").is(':checked'));
  $.ajax({
    type: "POST",
    url: "mldata",
    contentType: false,
    processData: false,
    cache: false,
    enctype: "multipart/form-data",
    data: formData,
    success: function (data) {
      console.log("Data received from algorithm");
      loadJsonData(data, obliterate = true);
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log("Send failed: \nStatus: " + textStatus + "\nError: " + errorThrown);
    }
  });
});

// add document
$("#fileInputControl").on("change", function () {
  console.log("Found " + this.files.length + " files");
  // add each file to documents
  [].forEach.call(this.files, function (file) {
    uploadDocFromFile(file);
  });
  this.value = "";
});

function uploadDocFromFile(file) {
  // clean up name of string and check if already belongs
  let fileName = file.name.replace(/\s+/g, "_").replace(/[^A-Za-z0-9\.\-\_]/g, '');
  if (tagModel.docIndex(fileName) !== -1) {
    alert("File already uploaded for: '" + fileName + "'\n");
  }
  // txt
  if (fileName.match(/.*\.text$|.*\.txt$/g) !== null) {
    console.log("Found txt file: '" + fileName + "'");
    // read, create, and add file
    let fileReader = new FileReader(file);
    fileReader.onload = function () {
      let newDoc = new Doc(fileName, fileReader.result.replace(/[\r\t\f\v\ ]+/g, " "));
      addDoc(newDoc);
    };
    fileReader.readAsText(file);
  }
  // json
  else if (fileName.match(/.*\.json$/g) !== null) {
    console.log("Found json file: '" + fileName + "'");
    // read, create, and add file
    let fileReader = new FileReader(file);
    fileReader.onload = function () {
      let newJson = fileReader.result.replace(/[\r\t\f\v\ ]+/g, " ");
      let errors = loadJsonData(JSON.parse(newJson));
      if (errors.length > 0) {
        alert(errors);
      }
    };
    fileReader.readAsText(file);
  }
  // zip
  else if (fileName.match(/.*\.zip$/g) !== null) {
    console.log("Found zip file: '" + fileName + "'");
    uploadDocsFromZipFile(file);
  }
  // wasn't one of the file types
  else {
    alert("File type not supported for: '" + fileName + "'");
  }
  // name matches one of the files already uploaded
}

function uploadDocsFromZipFile(file) {
  // load zip file
  JSZip.loadAsync(file).then(function (zip) {
    // do each file within zip
    [].forEach.call(Object.keys(zip.files), function (fileName) {
      if (tagModel.docIndex(fileName) !== -1) {
        alert("File already uploaded for: '" + fileName + "' in zip");
        return;
      }
      // mac compressed?
      if (fileName.match(/^__MACOSX/g) !== null) {
        alert("Ignored __MACOSX compression file: '" + fileName + "'");
        return;
      }
      // find file format then add
      zip.files[fileName].async('string').then(function (fileContents) {
        // zip
        if (fileName.match(/.*\.text$|.*\.txt$/g) !== null) {
          console.log("Found txt file: '" + fileName + "' in zip");
          let newDoc = new Doc(fileName, fileContents.replace(/[\r\t\f\v\ ]+/g, " "));
          addDoc(newDoc);
        }
        // json
        else if (fileName.match(/.*\.json$/g) !== null) {
          console.log("Found json file: '" + fileName + "' in zip");
          let newJson = fileContents.replace(/[\r\t\f\v\ ]+/g, " ");
          let errors = loadJsonData(JSON.parse(newJson));
          if (errors.length > 0) {
            alert(errors);
          }
        }
        // wasn't one of the file types
        else {
          alert("File type not supported for: '" + fileName + "'\n");
        }
      });
    });
  });
}

// check a or d button pressed
var aKeyPressed = false;
var dKeyPressed = false;
$(window).keydown(function (e) {
  if (e.which === 65) {
    aKeyPressed = true;
  } else if (e.which === 68) {
    dKeyPressed = true;
  }
}).keyup(function (e) {
  if (e.which === 65) {
    aKeyPressed = false;
  } else if (e.which === 68) {
    dKeyPressed = false;
  }
});

// on mouse release, highlight selected text
textArea.on('mouseup', function (e) {
  if (e.which === 1) {
    if (tagModel.currentCategory === null) {
      alert('Error: Please create a label!');
      return;
    }
    if (tagModel.currentDoc === null) {
      alert('Error: Please add a document!');
      return;
    }

    let range = {};
    if (textArea[0].selectionStart < textArea[0].selectionEnd) {
      range = {
        startPosition: textArea[0].selectionStart,
        endPosition: textArea[0].selectionEnd
      };

      let belongs = tagModel.currentDoc.getIndicesByRange(range, tagModel.currentCategory);

      if (aKeyPressed) {
        mostRecentIndex = tagModel.addAnnotation(range, tagModel.currentCategory);
        renderHighlights();
        clearSelection();
      } else if (dKeyPressed) {
        if (belongs.length > 0) {
          tagModel.removeAnnotationByRange(range);
          mostRecentIndex = -1;
          renderHighlights();
          clearSelection();
        }
      } else {
        delete_menu.css({
          top: e.pageY + 'px',
          left: e.pageX + 'px'
        });
        delete_menu.append('<h6>Which?</h6><hr style="margin: 0;">');
        delete_menu.append('<li class="add-anno" value="' + range.startPosition + ' ' + range.endPosition + '" style="background-color: #b7e8c7; font-weight: bold;">Add</li>');
        delete_menu.append('<li class="delete-anno-part" value="' + range.startPosition + ' ' + range.endPosition + '" style="background-color: #ef778c; font-weight: bold;">Delete</li>');
        delete_menu.show(100);
      }
    }
  }
});

// on right click, show annotations at position to delete
textArea.on('contextmenu', function (e) {
  event.preventDefault();
  let position = textArea[0].selectionStart;
  deleteList = tagModel.currentDoc.getAnnotationsAtPos(position);

  if (deleteList.length > 0) {
    delete_menu.append(
      $('<h6/>', {
        html: 'Delete Annotation:'
      })
    ).append(
      $('<hr/>', {
        style: 'margin: 0;'
      })
    );
    for (let i = 0; i < deleteList.length; i++) {
      delete_menu.append(
        $('<li/>', {
          class: 'delete-anno',
          value: 'delete_anno_' + i,
          style: 'background-color:' + tagModel.getColor(deleteList[i].label),
          html: '<b>' + deleteList[i].label.trunc(10) + ': </b>'
        }).append(
          deleteList[i].content.trunc(20).escapeHtml()
        )
      ).show(100).
        css({
          top: e.pageY + 'px',
          left: e.pageX + 'px'
        });
    }
  }
});

// create new label
$('#add-label').on('click', function () {
  var newLabel = makeRandName();
  console.log("CSS: Creating new category: [" + newLabel + "]");
  let label = addLabel(newLabel);
  let labelname = label.children(".label-name");
  labelname[0].contentEditable = true;
  labelname.focus().selectText();
});

//change the document's label context
label_list.on('mouseup', '.label', function () {
  //change label selection
  tagModel.currentCategory = this.getAttribute('value');
  $('.label').attr('id', '');                   //remove label-selected from all
  $(this).attr('id', 'label-selected');         //add label-selected to clicked
});

// on label right click
label_list.on('contextmenu', function (e) {
  event.preventDefault();
  delete_menu.append(
    $('<li/>', {
      class: 'delete-label',
      html: '<b>Delete</b>'
    })
  ).show(100).
    css({
      top: e.pageY + 'px',
      left: e.pageX + 'px'
    });
});

//edit label name
label_list.on('dblclick', '.label', function () {
  //enble editing
  $(this).children('.label-name')[0].contentEditable = true;
  //open textbox
  $(this).children('.label-name').focus().selectText();
});

// user pressed enter on label name change
label_list.on('keypress', '.label-name', function (e) {
  if (e.which === 13) {
    $(this).blur();
  }
});

//stopped editing label name
label_list.on('blur', '.label-name', function () {
  //disable editing
  this.contentEditable = false;

  //fix whitespace and create new label name with no spaces (class names can't have spaces)
  let newName = $(this).text().trim().replace(/\s+/g, "_").replace(/<|>/g, '');
  $(this).text(newName);
  console.log("Attempting to change label name from " + tagModel.currentCategory + " to " + newName);

  //check if the name is the same as previous
  if (newName === tagModel.currentCategory) {
    console.log('Aborting: Category is the same name as before');
    return;
  }

  //check for valid label name
  if ((tagModel.categoryIndex(newName) >= 0) || newName === '') {
    console.log('Aborting: Invalid label name: "' + newName + '"');
    $(this).text(tagModel.currentCategory);
    return;
  }

  // update styling for category
  $('#' + tagModel.currentCategory + '-style').remove();
  $('head').append(
    $('<style/>', {
      id: newName + '-style',
      html: '.hwt-content .label_' + newName + ' {background-color:' + tagModel.getColor(tagModel.currentCategory) + ';}'
    })
  );

  // update category name in list
  $('#label-selected').attr('value', newName);

  tagModel.renameCategory(newName);
  renderHighlights();
});

//invoke colorpicker on icon click
label_list.on('click', '.colorChange', function () {
  console.log('dropperClicked!');
  $('#colorChangePicker').click();   //invoke color picker
});

//change label color
$('#colorChangePicker').on('change', function () {
  console.log('colorPicked: ' + this.value);

  //update colors on page
  $('#label-selected').css('background-color', this.value);
  $('#' + tagModel.currentCategory + '-style').html(
    '.hwt-content .label_' + tagModel.currentCategory + ' {background-color: ' + this.value + ';}'
  );
  tagModel.changeColor(this.value);
  this.value = "black";
  renderHighlights();
});

// add document button
$('#add-document').on('click', function () {
  // todo add name checking // no spaces
  $('#fileInputControl').click();
});

// change document
doc_list.on('mouseup', '.doc-name', function (e) {
  tagModel.setCurrentDoc(this.getAttribute('value'));
  $('#doc-selected').attr('id', '');
  $(this).attr('id', 'doc-selected');
  textArea.text(tagModel.currentDoc.text.escapeHtml());
  mostRecentIndex = -1;
  renderHighlights();
  resize();
  $(window).scrollTop(0);
});

// right click document list
doc_list.on('contextmenu', function (e) {
  event.preventDefault();
  delete_menu.append(
    $('<li/>', {
      class: 'delete-doc',
      html: '<b>Delete</b>',
    })
  ).show(100).
    css({
      top: e.pageY + 'px',
      left: e.pageX + 'px'
    });
});

// clicked annotation // go to highlight position
$('.annotation').on('click', function () {
  let annoNum = $(this).attr('value');
  jumpToAnno(annoNum);
});

// annotation list // clicked annotation // go to highlight position
$('#anno-list').on('click', 'li', function () {
  let annoNum = $(this).attr('value');
  jumpToAnno(annoNum);
});

// clicked delete
delete_menu.on('click', 'li', function () {
  delete_menu.hide(100);
  // add annotation
  if ($(this).hasClass('add-anno')) {
    let value = $(this).attr('value').split(' ');
    var range = {
      startPosition: parseInt(value[0]),
      endPosition: parseInt(value[1])
    };
    mostRecentIndex = tagModel.addAnnotation(range, tagModel.currentCategory);
    console.log("Highlighted: " + range.startPosition + "-" + range.endPosition);
  }
  // delete partial highlight
  else if ($(this).hasClass('delete-anno-part')) {
    let value = $(this).attr('value').split(' ');
    var range = {
      startPosition: parseInt(value[0]),
      endPosition: parseInt(value[1])
    };
    if (tagModel.currentDoc.getIndicesByRange(range, tagModel.currentCategory).length > 0) {
      tagModel.removeAnnotationByRange(range);
    }
    mostRecentIndex = -1;
  }
  // delete full highlight
  else if ($(this).hasClass('delete-anno')) {
    let deleteIndex = parseInt($(this).attr('value').replace('delete_anno_', ''));
    tagModel.removeAnnotation(deleteList[deleteIndex]);
    mostRecentIndex = -1;
  }
  // delete label
  else if ($(this).hasClass('delete-label')) {
    tagModel.deleteCategory();
    console.log('Category Deleted');
    resize();
    $('#label-selected').remove();
    if (tagModel.currentDoc != null) {
      $('.label[value="' + tagModel.currentCategory + '"]').attr('id', 'label-selected');
    }
    mostRecentIndex = -1;
  }
  // delete document
  else if ($(this).hasClass('delete-doc')) {
    tagModel.deleteDoc();
    console.log('Document Deleted');
    if (tagModel.currentDoc != null) {
      textArea.text(tagModel.currentDoc.text.escapeHtml());
    } else {
      textArea.text('');
    }
    resize();
    $('#doc-selected').remove();
    if (tagModel.currentDoc != null) {
      $('.doc-name[value="' + tagModel.currentDoc.title + '"]').attr('id', 'doc-selected');
    }
    mostRecentIndex = -1;
  } else if ($(this).hasClass('delete-anno-list')) {
    let value = $(this).attr('value');
    tagModel.removeAnnotationByIndex(value);
    mostRecentIndex = -1;
  }
  renderHighlights();
});

// update size when window is resized
$(window).on('resize', function () {
  let scrollPercent = $(window).scrollTop() / $(document).height();
  resize();
  $(window).scrollTop(scrollPercent * $(document).height());
});

// ----- functions ----- //

//add new document
function addDoc(doc) {
  tagModel.addDoc(doc);
  tagModel.setCurrentDoc(doc.title.escapeHtml());
  textArea.text(tagModel.currentDoc.text.escapeHtml());
  resize();
  $('#doc-selected').attr('id', '');
  doc_list.append(
    $('<h6/>', {
      id: 'doc-selected',
      class: 'doc-name hoverWhite',
      value: doc.title.escapeHtml(),
      html: doc.title.escapeHtml()
    })
  );
  mostRecentIndex = -1;
  renderHighlights();
  doc_list.scrollTop(doc_list.prop('scrollHeight'));
};

//add new label
function addLabel(name, color = null) {
  if (tagModel.categoryIndex(name) === -1) {
    if (color === null) {
      color = makeRandColor();
    }
    tagModel.addCategory(name, color);

    // add highlight rule to page
    $('head').append(
      $('<style/>', {
        id: name + '-style',
        class: 'highlight-style',
        html: '.hwt-content .label_' + name + ' {background-color: ' + color + ';}'
      })
    );

    // select new category
    tagModel.currentCategory = name;
    $('#label-selected').attr('id', '');

    // add category to page
    var newLabel = $('<div/>', {
      class: 'hoverWhite label',
      id: 'label-selected',
      value: name,
      style: "background-color: " + color
    }).append(
      $('<img/>', {
        class: 'colorChange',
        src: 'https://img.icons8.com/metro/24/000000/color-dropper.png',
      })
    ).append(
      $('<div/>', {
        class: 'label-name'
      }).text(name)
    );

    $('#label-list').append(newLabel);

    // go to new label's postion
    $('#label-list').scrollTop($('#label-list').prop('scrollHeight'));

    // first color => make current category the color
    tagModel.currentCategory = name;
    $('.label[value=' + name + ']').attr('id', 'label-selected');
  } else {
    console.log('Failed to add label "' + name + '": label already exists!');
  }
  return newLabel;
}

//update height on window resize and keep scroll position
function resize() {
  $('.highlight').offset(textArea.offset());
  textArea.height('auto');
  textArea.height(textArea.prop('scrollHeight') + 1);
  $('.highlight').css('height', textArea.height);
}

// generate random name
function makeRandName() {
  return parseInt(Math.random() * Math.pow(10, 14)).toString(36);
}

// generate random color
function makeRandColor() {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 10) + 6).toString(16);
  });
}

// import json data
function loadJsonData(data, filename = "", obliterate = false, ) {
  if (obliterate) {
    console.log('Displaying new data');
    tagModel = new TagModel();
    $('.label').remove();
    $('.highlight-style').remove();
    $('.doc-name').remove();
  }

  // for invalid files
  let invalidFiles = [];

  // add remove annotation from annotation list
  try {
    // json array
    data.forEach(function (doc) {
      addJsonElement(doc);
    });
  } catch (err) {
    // caught an error
    if (err instanceof TypeError) {
      // single json file
      try {
        addJsonElement(data);
      } catch (innerErr) {
        alert("Not valid json Input")
      }
    }
    // we shouldn't be here
    else {
      console.log('SNAFU');
    }
  }

  function addJsonElement(doc) {
    // check if file belongs
    if (tagModel.docIndex(doc.title) > -1) {
      invalidFiles.push("File already uploaded for: '" + doc.title + "'\n");
      return;
    }
    // create and add doc
    var newDoc = new Doc(doc.title, doc.text);
    addDoc(newDoc);
    tagModel.currentDoc = newDoc;
    doc.annotations.forEach(function (annotation) {
      if (tagModel.categoryIndex(annotation.label) === -1) {
        addLabel(annotation.label);
      }
      tagModel.addAnnotation(annotation.range, annotation.label);
    });
  }

  // update everything
  textArea.text(tagModel.currentDoc.text.escapeHtml());
  renderHighlights();
  resize();
  $(window).scrollTop(0);

  // return errors
  if (invalidFiles.length > 0) {
    let warning = filename + ":\n";
    invalidFiles.forEach(function (string) {
      warning += string;
    });
    return warning;
  }
  return '';
}

// make all highlights and annotation list
function renderHighlights() {
  // clear old annotation list
  $('#anno-list').empty();
  // clear old highlights
  $('.hwt-backdrop').remove();
  // no document // do nothing // (=== doesn't seem to work here)
  if (tagModel.currentDoc == null) {
    return;
  }
  // get all annnotations by label
  let labelSortedAnnos = tagModel.currentDoc.getAnnotationsByLabel();
  let text = tagModel.currentDoc.text.escapeHtml();
  // calculate offset for height
  let offset = 0;
  if (labelSortedAnnos.length > 1) {
    offset = 4.6 / (labelSortedAnnos.length - 1);
  }
  // inital padding height
  let padding = 0;
  // set annotation number
  let annoNum = 0;
  // do each category
  for (let category of labelSortedAnnos) {
    // annotations list
    if (category.length === 0) {
      continue;
    }
    var annoHeader = $('<h2/>', {
      html: category[0].label + '<img class="dropArrow upsideDown" src=static/images/arrowDownWhite.png>',
      class: 'annoHeader hoverWhite',
      value: tagModel.getColor(category[0].label)
    });
    $('#anno-list').append(annoHeader).append(
      $('<ul/>', {
        class: 'anno-group',
        value: category[0].label
      })
    );
    annoHeader.click();
    // create highlight area
    var highlights = $('<div/>', {
      class: "hwt-highlights hwt-content"
    });
    // keep tack of index of text
    let lastIndex = 0;
    let newText = '';
    // do each annotation for current category
    for (let anno of category) {
      // add annotation to label
      $('.anno-group[value="' + anno.label + '"]').append(
        $('<li/>', {
          class: 'annotation hoverWhite',
          style: 'background-color: ' + tagModel.getColor(anno.label),
          value: annoNum
        }).text(anno.content.trunc(20, true).escapeHtml())
      );

      // Add text before highlight then the highlight itself
      newText += text.substring(lastIndex, anno.range.startPosition);
      newText += '<mark class="highlight label_' + anno.label + '" value="' + annoNum + '" style="padding: ' + padding + 'px 0;">' + text.substring(anno.range.startPosition, anno.range.endPosition) + '</mark>';
      lastIndex = anno.range.endPosition;;
      annoNum += 1;
    }
    //update padding size
    padding += offset;
    // add trailing text
    if (lastIndex !== text.length) {
      newText += text.substring(lastIndex, text.length);
    }
    highlights.html(newText);
    // push as first child // important for order
    highlightArea.prepend(
      $('<div/>', {
        class: 'hwt-backdrop'
      }).append(highlights)
    );
  }
  // update most recent
  if (mostRecentIndex != -1) {
    $('#recent').text(tagModel.currentDoc.annotations[mostRecentIndex].content.trunc(20, true).escapeHtml()).css('background-color', tagModel.getColor(tagModel.currentDoc.annotations[mostRecentIndex].label)).attr('value', mostRecentIndex);
    $('#recentArea').css('display', 'block');
  }
  // hide it otherwise
  else {
    $('#recentArea').css('display', 'none');
  }
}

function clearSelection() {
  var selection = window.getSelection ? window.getSelection() : document.selection ? document.selection : null;
  if (selection) selection.empty ? selection.empty() : selection.removeAllRanges();
}

function jumpToAnno(num) {
  $(window).scrollTop($('.highlight[value="' + num + '"]').offset().top);
}

// pass as safe text
String.prototype.escapeHtml = function () {
  return this.replace(/<|>/g, "_");
}

// truncate string and add ellipsis // truncAfterWord will only truncate on spaces // returns entire word if string contains no spaces
String.prototype.trunc = function (n, truncAfterWord = false) {
  if (this.length <= n) { return this; }
  let subString = this.substr(0, n - 1);
  let truncString = (truncAfterWord ? subString.substr(0, subString.lastIndexOf(' ')) : subString) + "…";
  return (truncString.length === 1 ? subString.substring(0, subString.length - 1) + "…" : truncString);
};

// select all text in element
jQuery.fn.selectText = function () {
  var doc = document;
  var element = this[0];
  if (doc.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};