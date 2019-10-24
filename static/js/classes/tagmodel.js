//jshint esversion: 6

class TagModel{
  constructor(){
    this.currentDoc = {};
    this.openDocs = [];

    /*TODO: categories should be an array of strings,
     *each string representing the label categories.
     *The tagModel doesn't need to know the color, just
     * the category*/
    this.currentCategory = {};
    this.categories = [];
  }


  hasNoDocuments(){
    return this.openDocs.length == 0;
  }

  addDoc(doc){
    this.openDocs.push(doc);
  }

  setCurrentDoc(name){
    this.currentDoc = this.openDocs.find(doc => doc.title == name);
  }

  addAnnotation(range, currentLabel){
    //validate annotation first, throw error if dumbo
    if (this.validateAnnotationRange(range)){
      let content = this.extractAnnotationContent(range);
      let annotationToAdd = new Annotation(range, content, currentLabel);
      this.currentDoc.annotations.push(annotationToAdd);
    }
  }

  validateAnnotationRange(range){
    return range.startPosition < range.endPosition;
  }

  extractAnnotationContent(range){
    return this.currentDoc.text.substring(range.startPosition, range.endPosition);
  }

  removeAnnotation(position){
    let annotationToRemove = this.currentDoc.getMostRecentAnnotationContainingCharacter(position);
    this.currentDoc.removeAnnotation(annotationToRemove);
  }

  exportAsString(){
    return JSON.stringify(this.openDocs);
  }
}
