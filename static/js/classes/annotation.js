//jshint esversion:6

class Annotation {
  constructor(range, content, label) {
    this.range = {
      startPosition: range.startPosition,
      endPosition: range.endPosition
    };
    this.content = content;
    this.label = label;
  }

  containsCharacterAt(position){
    return position >= this.range.startPosition && position <= this.range.endPosition;
  }
}