//jshint esversion: 6

class TagModel {
  constructor() {
    this.currentDoc = null;
    this.openDocs = [];
    this.currentCategory = null;
    this.categories = [];
    this.deleteList = [];
  }

  // ----- documents ----- //

  addDoc(doc) {
    this.openDocs.push(doc);
    return this.openDocs.length;
  }

  setCurrentDoc(name) {
    this.currentDoc = this.openDocs.find(doc => doc.title == name);
  }

  // ----- annotations ----- //

  addAnnotation(range, currentLabel) {
    //validate annotation first, throw error if dumbo
    let content = this.currentDoc.text.substring(range.startPosition, range.endPosition);
    let annotationToAdd = new Annotation(range, content, currentLabel);
    this.currentDoc.annotations.push(annotationToAdd);
  }

  getAnnotationsAtPos(position) {
    this.deleteList = this.currentDoc.getAnnotationsAtPos(position);
    return this.deleteList;
  }

  getDeleteItem(index) {
    return this.deleteList[index];
  }

  clearDeleteList() {
    this.deleteList = [];
  }

  removeAnnotation(annotation) {
    this.currentDoc.removeAnnotation(annotation);
    this.clearDeleteList();
  }

  // ----- Categories ----- //

  addCategory(name, color) {
    let newCategory = new Category(name, color);
    this.categories.push(newCategory);
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
    // update category name of each annotation
    this.currentDoc.annotations.forEach(function (annotation) {
      if (annotation.label === tagModel.currentCategory) {
        annotation.label = newName;
      }
    });

    // update name in categories list
    this.categories.find(category => category.name == this.currentCategory).name = newName;
    this.currentCategory = newName;
  }

  removeCategory() {
    this.categories.splice(this.checkCategory)
  }

  // ----- color ----- //

  changeColor(color) {
    // update color in category list
    this.categories.find(category => category.name == this.currentCategory).color = color;
  }

  getColor(labelname) {
    return this.categories.find(category => category.name === labelname).color;
  }

  // ----- export ----- //

  exportAsString() {
    return JSON.stringify(this.openDocs);
  }
}
