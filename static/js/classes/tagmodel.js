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

  addAnnotation(annotation){
    //validate annotation first, throw error if dumbo
    if (this.validateAnnotationRange(annotation)){
      this.currentDoc.annotations.push(annotation);
    }else{
      console.log("Range not Valid!");
    }
  }

  validateAnnotationRange(annotation){
    return annotation.range.startPosition < annotation.range.endPosition;

  }

  removeAnnotation(position){
    let annotationToRemove = this.currentDoc.getMostRecentAnnotationContainingCharacter(position);
    this.currentDoc.removeAnnotation(annotationToRemove);
  }

  exportAsString(){
    return JSON.stringify(this.openDocs);
  }
}
