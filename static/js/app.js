//jshint esversion:6

/* ---------- page setup ---------- */
var textArea = $('#doc-view');
var tagModel = new TagModel();

// --------------events-------------- //

// prevent right clicking
$(document).on('contextmenu', function () {
  event.preventDefault();
});

// download highlights
$('#download').on('click', function () {
  console.log("JSON download requested...");
  // no files found
  if (tagModel.openDocs.length === 0) {
    alert('Error: No data to download!');
    return;
  }

  // file download
  var blob = new Blob([tagModel.exportAsString()], { type: 'application/JSON' });
  var url = window.URL.createObjectURL(blob);
  console.log("Generated object URL: " + url);
  document.getElementById('download_link').href = url;
  document.getElementById('download_link').click();
  window.URL.revokeObjectURL(url);
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
  formData.append("jsonUpload", blob);
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
      loadJsonData(data, true);
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log("Send failed: \nStatus: " + textStatus + "\nError: " + errorThrown);
    }
  });
});

// on file change, add document
$("#fileInputControl").on("change", function () {
  console.log("Found " + this.files.length + " files");
  // add each file to documents
  $(document.body).css('cursor', 'wait');
  [].forEach.call(this.files, function (file) {
    // clean up name of string
    let fileName = file.name.replace(/\s/g, "_").replace(/[^A-Za-z0-9\.\-\_]/g, '');
    if (tagModel.docIndex(fileName) === -1) {
      // not a text file
      if (fileName.match(/.*\.txt$/g) === null) {
        console.log("Not a text file");
        return
      }
      // read, create, and add file
      let fileReader = new FileReader(file);
      fileReader.onload = function () {
        let newDoc = new Doc(fileName, fileReader.result);
        console.log("Created Doc: " + fileName);
        addDoc(newDoc);
      };
      fileReader.readAsText(file);
    } else {
      console.log("File already uploaded")
    }
  });
  $(document.body).css('cursor', 'default');
  this.value = "";
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
    let range = {
      'startPosition': textArea[0].selectionStart,
      'endPosition': textArea[0].selectionEnd
    };
    if (range.startPosition < range.endPosition) {
      let annotationCreated = tagModel.addAnnotation(range, tagModel.currentCategory);
      console.log("Highlighted: " + range.startPosition + "-" + range.endPosition);
      $('#recent').text(annotationCreated.content.trunc(50, true));
      addToList(annotationCreated.content);
    } else {
      return;
    }
    renderTextareaHighlights();
  }
  // on right click, show annotations at position to delete
  else if (e.which === 3) {
    let position = textArea[0].selectionStart;
    let annotations = tagModel.getAnnotationsAtPos(position);
    if (annotations.length > 0) {
      $('#delete-menu').append('<h6>Delete Annotation:</h6><hr style="margin: 0;">')
      for (let i = 0; i < annotations.length; i++) {
        $('#delete-menu').append('<li class="delete-anno" value="delete_anno_' + i + '" style="background-color:' + tagModel.getColor(annotations[i].label) + ';"><b>' + annotations[i].label.trunc(10) + ': </b>' + annotations[i].content.trunc(20) + '</li>');
      }
      $('#delete-menu').show(100).
        css({
          top: e.pageY + 'px',
          left: e.pageX + 'px'
        });
    }
  }
});

// clicked the menu
$(document).on("mousedown", function (e) {
  // If the clicked element is not the menu
  if ($(e.target).parents("#delete-menu").length === 0) {
    // Hide it
    tagModel.clearDeleteList();
    $("#delete-menu").hide(100);
    $("#delete-menu").text('')
  };
});

// on annotation delete menu click, delete selected annotation
$("#delete-menu").on('click', '.delete-anno', function () {
  let deleteIndex = parseInt($(this).attr("value").replace('delete_anno_', ''));
  tagModel.removeAnnotation(tagModel.getDeleteItem(deleteIndex));
  console.log('Annotation Deleted');
  renderTextareaHighlights();
  // Hide it AFTER the action was triggered
  $("#delete-menu").hide(100);
});

// create new label
$('#add-label').on('click', function () {
  // todo add name checking // no spaces
  // todo change to real add function
  var newLabel = makeRandName();
  console.log("CSS: Creating new category: [" + newLabel + "]");
  addLabel(newLabel);
});

//change the label selected
$('#label-list').on('mouseup', '.label', function (e) {
  console.log("Selected label: [" + this.getAttribute('value') + "]");

  //change label selection
  tagModel.currentCategory = this.getAttribute('value');
  $('.label').attr('id', '');                   //remove label-selected from all
  $(this).attr('id', 'label-selected');         //add label-selected to clicked

  if (e.which === 3) {
    $('#delete-menu').append('<li class="delete-label" value=""><b>' + 'delete' + '</b></li>');
    $('#delete-menu').show(100).
      css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
      });
  }
});

$("#delete-menu").on('click', '.delete-label', function () {
  tagModel.deleteCategory();
  console.log('Category Deleted');
  resize();
  $('#label-selected').remove();
  if (tagModel.currentDoc != null) {
    $('.label[value="' + tagModel.currentCategory + '"]').attr('id', 'label-selected');
  }
  renderTextareaHighlights();
  // Hide it AFTER the action was triggered
  $("#delete-menu").hide(100);
});

//edit label name
$('#label-list').on('dblclick', '.label-name', function () {
  //enble editing
  this.contentEditable = true;
  //open textbox
  $(this).focus().select();
});

//stopped editing label name
$('#label-list').on('blur', '.label-name', function () {
  //disable editing
  this.contentEditable = false;

  //fix whitespace and create new label name with no spaces (class names can't have spaces)
  $(this).text($(this).text().trim());
  let newName = $(this).text().replace(/\s/g, "_").replace(/[\W]/g, '');
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
  renderTextareaHighlights();
});

//invoke colorpicker on icon click
$('#label-list').on('click', '.colorChange', function () {
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
});

// add document button
$('#add-document').on('click', function () {
  // todo add name checking // no spaces
  $('#fileInputControl').click();
});

// change document
$('#doc-list').on('mouseup', '.doc-name', function (e) {
  tagModel.setCurrentDoc(this.getAttribute('value'));
  $('#doc-selected').attr('id', '');
  $(this).attr('id', 'doc-selected');
  textArea.html(tagModel.currentDoc.text);
  renderTextareaHighlights();
  resize();
  $(window).scrollTop(0);

  if (e.which === 3) {
    $('#delete-menu').append('<li class="delete-doc" value=""><b>' + 'delete' + '</b></li>');
    $('#delete-menu').show(100).
      css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
      });
  }
});

$("#delete-menu").on('click', '.delete-doc', function () {
  tagModel.deleteDoc();
  console.log('Document Deleted');
  if (tagModel.currentDoc != null) {
    textArea.html(tagModel.currentDoc.text);
  } else {
    textArea.html('');
  }
  resize();
  $('#doc-selected').remove();
  if (tagModel.currentDoc != null) {
    $('.doc-name[value="' + tagModel.currentDoc.title + '"]').attr('id', 'doc-selected');
  }
  renderTextareaHighlights();
  // Hide it AFTER the action was triggered
  $("#delete-menu").hide(100);
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
  tagModel.addDoc(doc)
  tagModel.setCurrentDoc(doc.title);
  textArea.html(tagModel.currentDoc.text);
  resize();
  $('#doc-selected').attr('id', '');
  $('#doc-list').append(
    $('<h6/>', {
      id: 'doc-selected',
      class: 'doc-name',
      value: doc.title,
      html: doc.title
    }));
  renderTextareaHighlights();
  $('#doc-list').scrollTop($('#doc-list').prop('scrollHeight'));
};

//Actually draws the highlights on the textarea.
function renderTextareaHighlights() {
  //array to hold everything that needs to be highlighted in doc
  let highlights = [];

  //loop through the stored annotations and append to the array as a dictionary
  if (tagModel.currentDoc != null) {
    tagModel.currentDoc.annotations.forEach(function (annotation) {
      let single_highlight = {
        highlight: [annotation.range.startPosition, annotation.range.endPosition],
        className: 'label_' + annotation.label
      };
      highlights.push(single_highlight);
    });
  }

  //then highlight based on that array
  $('textarea').highlightWithinTextarea({
    highlight: highlights
  });
}

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
    $('#label-list').append(
      $('<div/>', {
        class: 'list-group-item py-2 px-3 label',
        id: 'label-selected',
        value: name,
        style: "background-color: " + color,
        html: '<img src="https://img.icons8.com/metro/24/000000/color-dropper.png" class="colorChange"><div  class="label-name">' + name + '</div>'
      }));

    // go to new label's postion
    $('#label-list').scrollTop($('#label-list').prop('scrollHeight'));

    // add to annotation list
    $('#anno-list').append(
      $('<h4/>', {
        class: 'ml-2',
        html: name
      })
    ).append(
      $('<div/>', {
        class: 'list-group',
        value: name
      })
    );

    // first color => make current category the color
    if (tagModel.categories.length === 1) {
      tagModel.currentCategory = name;
      $('.label[value=' + name + ']').attr('id', 'label-selected');
    }
  } else {
    console.log('Failed to add label "' + name + '": label already exists!');
  }
}

function addToList(content) {
  if (tagModel.currentCategory != null) {
    $('.list-group[value="' + tagModel.currentCategory + '"]').append(
      $('<ul/>').text(content.trunc(20, true))
    );
    console.log('Success!\nAdded ' + content + ' to ' + tagModel.currentCategory + ' annotation list.');
  }
}

//update height on window resize and keep scroll position
function resize() {
  textArea.height('auto');
  textArea.height(textArea.prop('scrollHeight') + 1);
}

// make fake name // delete when done
function makeRandName() {
  return parseInt(Math.random() * Math.pow(10, 14)).toString(36);
}

function makeRandColor() {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 10) + 6).toString(16);
  });
}

function loadJsonData(data, obliterate = false) {
  console.log('Displaying new data from mlalgorithm');
  if (obliterate) {
    tagModel = new TagModel();
    $('.label').remove();
    $('.highlight-style').remove();
    $('.doc-name').remove();
  }
  // add remove annotation from annotation list
  data.forEach(function (doc) {
    var newDoc = new Doc(doc.title, doc.text);
    addDoc(newDoc);
    tagModel.currentDoc = newDoc;
    doc.annotations.forEach(function (annotation) {
      if (tagModel.categoryIndex(annotation.label) === -1) {
        addLabel(annotation.label);
      };
      tagModel.addAnnotation(annotation.range, annotation.label);
    });
  });

  textArea.html(tagModel.currentDoc.text);
  renderTextareaHighlights();
  resize();
  $(window).scrollTop(0);
}

String.prototype.trunc = function (n, truncAfterWord = false) {
  if (this.length <= n) { return this; }
  var subString = this.substr(0, n - 1);
  return (truncAfterWord ? subString.substr(0, subString.lastIndexOf(' ')) : subString) + "…";
};