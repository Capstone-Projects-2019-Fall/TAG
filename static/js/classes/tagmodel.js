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
    console.log("Adding document: '" + doc.title + "'");
    this.openDocs.push(doc);
  }

  setCurrentDoc(name) {
    console.log("Set current document to: '" + name + "'");
    this.currentDoc = this.openDocs.find(doc => doc.title === name);
  }

  docIndex(name) {
    for (let index = 0; index < this.openDocs.length; index++) {
      if (this.openDocs[index].title === name) {
        return index;
      }
    }
    return -1;
  }

  deleteDoc() {
    let docToDelete = this.currentDoc;
    this.openDocs = this.openDocs.filter(function (doc) {
      return doc != docToDelete;
    });
    this.currentDoc = this.openDocs[0];
  }

  // ----- annotations ----- //

  addAnnotation(range, category) {
    //validate annotation first, throw error if dumbo
    let content = this.currentDoc.text.substring(range.startPosition, range.endPosition).trim();
    let annotationToAdd = new Annotation(range, content, category);
    console.log("Adding annotation: '" + annotationToAdd.content + "' to: [" + category + "]");
    this.currentDoc.annotations.push(annotationToAdd);
    return annotationToAdd;
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
    console.log("Removing annotation: '" + annotation.content + "' from [" + this.currentCategory + "]");
    this.currentDoc.updateAnnotationList(annotation);
    this.clearDeleteList();
  }

  // ----- Categories ----- //

  addCategory(name, color) {
    let newCategory = new Category(name, color);
    console.log("Adding category: [" + newCategory.name + "]");
    this.categories.push(newCategory);
  }

  categoryIndex(name) {
    for (let index = 0; index < this.categories.length; index++) {
      if (this.categories[index].name === name) {
        return index;
      }
    }
    return -1;
  }

  renameCategory(newName) {
    // update category name of each annotation
    this.openDocs.forEach(function (doc) {
      doc.annotations.forEach(function (annotation) {
        if (annotation.label === tagModel.currentCategory) {
          annotation.label = newName;
        }
      })
    });

    //then update the label name in the category list
    this.categories.find(category => category.name === this.currentCategory).name = newName;
    this.currentCategory = newName;

    console.log("Relabeled annotation to " + newName + ".");
  }

  deleteCategory() {
    let categoryToDelete = this.currentCategory;
    this.openDocs.forEach(function (doc) {
      doc.annotations = doc.annotations.filter(function (annotation) {
        return annotation.label != categoryToDelete;
      });
    });
    this.categories.splice(this.categories.indexOf(this.categories.find(category => category.name === this.currentCategory)), 1);
    if (this.categories.length > 0) {
      this.currentCategory = this.categories[0].name;
    } else {
      this.currentCategory = null;
    }
  }

  // ----- color ----- //

  changeColor(color) {
    // update color in category list
    this.categories.find(category => category.name === this.currentCategory).color = color;
  }

  getColor(labelname) {
    return this.categories.find(category => category.name === labelname).color;
  }

  // ----- export ----- //

  exportAsString() {
    return JSON.stringify(this.openDocs);
  }
}
