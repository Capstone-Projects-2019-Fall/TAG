//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }


  getAnnotationsAtPos(position){
    return this.annotations.filter(function (annotation) {
      return annotation.containsCharacterAt(position);
    });
  }

  removeAnnotation(annotationToRemove){
    this.annotations = this.annotations.filter(function (annotation) {
      return annotation != annotationToRemove;
    }
  );
  }
}
