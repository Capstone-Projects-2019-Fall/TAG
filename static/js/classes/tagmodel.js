//jshint esversion: 6

class TagModel {
  constructor() {
    this.currentDoc = {};
    this.openDocs = [];
    this.currentCategory = null;
    this.categories = [];
  }


  hasNoDocuments() {
    return this.openDocs.length == 0;
  }

  addDoc(doc) {
    this.openDocs.push(doc);
  }

  setCurrentDoc(name) {
    this.currentDoc = this.openDocs.find(doc => doc.title == name);
  }

  addAnnotation(range, currentLabel) {
    //validate annotation first, throw error if dumbo
    if (range.startPosition < range.endPosition) {
      let content = this.currentDoc.text.substring(range.startPosition, range.endPosition);
      let annotationToAdd = new Annotation(range, content, currentLabel);
      this.currentDoc.annotations.push(annotationToAdd);
    }
  }

  removeAnnotation(position) {
    let annotationToRemove = this.currentDoc.getMostRecentAnnotationContainingCharacter(position);
    this.currentDoc.removeAnnotation(annotationToRemove);
  }

  addCategory(name, color) {
    let newCategory = new Category(name, color);
    this.categories.push(newCategory);

    // add highlight rule to page
    $('head').append(
      $('<style/>', {
        id: name + '-style',
        html: '.hwt-content .label_' + name + ' {background-color: ' + color + ';}'
      })
    );

    // add label to page
    $('#label-list').append(
      $('<div/>', {
        class: 'list-group-item py-2 px-3 label',
        value: name,
        style: "background-color: " + color,
        html: '<div class="label-name">' + name + '</div><img src="https://img.icons8.com/metro/24/000000/color-dropper.png" class="colorChange" style="float: right;"><input class="colorChangePicker" type="color" style="height:0; width:0; visibility: hidden;">'
      }));

    // first color => make current category the color
    if (this.categories.length == 1) {
      this.currentCategory = name;
      $('.label[value=' + name + ']').attr('id', 'label-selected');
    }
  }

  checkCategory(name) {
    for (let index = 0; index < this.categories.length; index++) {
      if (this.categories[index].name === name) {
        return index;
      }
    }
    return -1;
  }

  renameCategory(newName) {
    var catColor;
    // update name in categories list
    for (let category of this.categories) {
      if (category.name === this.currentCategory) {
        category.name = newName;
        catColor = category.color;
        break;
      }
    }

    // update category name of each annotation
    this.currentDoc.annotations.forEach(function (annotation) {
      if (annotation.label === tagModel.currentCategory) {
        annotation.label = newName;
      }
    });

    // update styling for category
    $('#' + tagModel.currentCategory + '-style').remove();
    $('head').append(
      $('<style/>', {
        id: newName + '-style',
        html: '.hwt-content .label_' + newName + ' {background-color:' + catColor + ';}'
      })
    );

    // update category name in list
    $('.label[value=' + this.currentCategory + ']').attr('value', newName);
    this.currentCategory = newName;
  }

  removeCategory() {
    // TODO
  }

  changeColor(color) {
    // update color in category list
    for (let category of this.categories) {
      if (category.name === this.currentCategory) {
        category.color = color;
        break;
      }
    }

    //update colors on page
    $('.label[value=' + this.currentCategory + ']').css('background-color', color);
    $('#' + this.currentCategory + '-style').html(
      '.hwt-content .label_' + tagModel.currentCategory + ' {background-color: ' + color + ';}'
    );
  }

  exportAsString() {
    return JSON.stringify(this.openDocs);
  }
}
