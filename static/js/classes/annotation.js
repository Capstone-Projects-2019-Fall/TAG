//jshint esversion:6

class Annotation {
  constructor(range, content, label) {
    this.range = {
      startPosition: range.startPosition,
      endPosition: range.endPosition
    };
    this.content = content;
    this.label = label;
    this.id = Annotation.idFactory++;

  }

  containsCharacterAt(position){
    return position >= this.range.startPosition && position <= this.range.endPosition;
  }
}

//STATIC var, used to assign each annotation an id.  Incremented in constructor
//The larger that id of an annotation, the more recently it was created.
Annotation.idFactory = 0;
