//jshint esversion:6

class Annotation {
  constructor(startPosition, endPosition, content, label){
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.content = content;
    this.label = label;
  }

  getRange(){
    return [this.startPosition, this.endPosition];
  }
}
