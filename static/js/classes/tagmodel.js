//jshint esversion: 6

class TagModel {
  constructor() {
    this.currentDoc = {};
    this.openDocs = [];
    this.currentCategory = null;
    this.categories = [];
  }

  addDoc(doc) {
    console.log("Adding document: '" + doc.title + "'");
    this.openDocs.push(doc);
  }

  setCurrentDoc(name) {
    this.currentDoc = this.openDocs.find(doc => doc.title === name);
    console.log("Set current document to: '" + this.currentDoc.title + "'");
  }

  addAnnotation(range) {
    //validate annotation first, throw error if dumbo
    let content = this.currentDoc.text.substring(range.startPosition, range.endPosition).trim();
    let annotationToAdd = new Annotation(range, content, this.currentCategory);
    console.log("Adding annotation: '" + annotationToAdd.content + "' to: [" + this.currentCategory + "]");
    this.currentDoc.annotations.push(annotationToAdd);
    return annotationToAdd;
  }

  removeAnnotation(position) {
    let annotationToRemove = this.currentDoc.getAnnotation(position);
    console.log("Removing annotation: '" + annotationToRemove.content + "' from [" + this.currentCategory + "]");
    this.currentDoc.updateAnnotationList(annotationToRemove);
  }

  addCategory(name, color) {
    let newCategory = new Category(name, color);
    console.log("Adding category: [" + newCategory.name + "]");
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
    //iterate through the annotations and update their labels
    let count = 0;
    this.currentDoc.annotations.forEach(function (annotation) {
      if (annotation.label === tagModel.currentCategory) {
        count++;
        console.log("Relabeling [" + annotation.label + "] to [" + newName + "]");
        annotation.label = newName;
      }
    });

    //then update the label name in the category list
    this.categories.find(category => category.name === this.currentCategory).name = newName;
    this.currentCategory = newName;

    console.log("Relabeled " + count + " annotations.");
  }

  removeCategory() {
    this.categories.splice(this.checkCategory)
  }

  changeColor(color) {
    // update color in category list
    this.categories.find(category => category.name === this.currentCategory).color = color;
  }

  getColor() {
    return this.categories.find(category => category.name === this.currentCategory).color;
  }

  exportAsString() {
    return JSON.stringify(this.openDocs);
  }
}
