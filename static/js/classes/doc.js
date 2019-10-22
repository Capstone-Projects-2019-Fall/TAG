//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }

  // getAnnotationRanges() {
  //   return this.annotations.map(function (annotation) { return annotation.getRangeAsArray(); });
  // }

  getAnnotationsContainingCharacter(position){
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
