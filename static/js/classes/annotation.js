//jshint esversion:6

class Annotation {
  // // range = {};
  // content;
  // label;

  constructor(range, content, label){
    // this.range.startPosition = range["startPosition"];
    // this.range.endPosition = range["endPosition"];
    this.range = {startPosition: range.startPosition, endPosition : range.endPosition};
    this.content = content;
    this.label = label;
  }

  getRangeAsArray(){
    return [this.range.startPosition, this.range.endPosition];
  }
}
