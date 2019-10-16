//jshint esversion:6


class AnnotationCollection {
  constructor(){
    this.annotations = [];
  }
  addAnnotation(annotation){
    this.annotations.push(annotation);
  }

  removeAnnotation(annotation){
    this.annotations.delete(annotation);
  }
  getRanges(){
    return this.annotations.map(function(annotation){
      return annotation.getRange();
    });
  }
}
