//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }


  getAnnotationsContainingCharacter(position){
    return this.annotations.filter(function (annotation) {
      return annotation.containsCharacterAt(position);
    });
  }


  getMostRecentAnnotationContainingCharacter(position){
    let annotations = this.getAnnotationsContainingCharacter(position);
    return annotations.pop();
  }


  removeAnnotation(annotationToRemove){
    this.annotations = this.annotations.filter(function (annotation) {
      return annotation != annotationToRemove;
    }
  );
  }
}
