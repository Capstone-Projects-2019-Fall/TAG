//jshint esversion:6

class Document {
  constructor(title, text){
    this.title = title;
    this.text = text;
    this.annotations = [];
    for(var i = 0; i < 4; i++){
      this.annotations.push(new AnnotationCollection());
    }
  }
  addAnnotation(category, annotation){
    this.annotations[category].addAnnotation(annotation);
  }

  getAnnotationListByCategory(category){
    return this.annotations[category];
  }
}
