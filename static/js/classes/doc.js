//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }

  getAnnotation(position){
    let annotations =  this.annotations.filter(function (annotation) {
      return annotation.containsCharacterAt(position);
    });

    if(annotations.length !== 0) {
      return annotations.pop();
    }
    else {
      console.log("Invalid highlight removal!")
    }
  }

  updateAnnotationList(blacklistAnnotation){
    this.annotations = this.annotations.filter(function (annotation) {
      return annotation !== blacklistAnnotation;
    }
  );
  }
}
