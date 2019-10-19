//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }

  getAnnotationRanges() {
    return this.annotations.map(function (annotation) { return annotation.getRangeAsArray(); });
  }
}
