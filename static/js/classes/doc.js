//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }

  getAnnotationsAtPos(position){
    let annotations =  this.annotations.filter(function (annotation) {
      return annotation.containsCharacterAt(position);
    });
    return annotations
  }

  updateAnnotationList(blacklistAnnotation){
    this.annotations = this.annotations.filter(function (annotation) {
      return annotation !== blacklistAnnotation;
    }
  );
  }
}
