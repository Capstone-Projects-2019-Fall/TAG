//jshint esversion:6

class Annotation {

  constructor(range, content, highlighter_color, label){
    this.range = {
      startPosition: range.startPosition,
      endPosition : range.endPosition
    };
    this.content = content;
    this.highlighter_color = highlighter_color;
    this.label = label;
  }

  getRangeAsArray(){
    return [this.range.startPosition, this.range.endPosition];
  }
}
