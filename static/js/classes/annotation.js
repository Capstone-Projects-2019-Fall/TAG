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
}