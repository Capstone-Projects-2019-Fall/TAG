//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }

  getAnnotationsAtPos(position) {
    let annotations = this.annotations.filter(function (annotation) {
      return annotation.containsCharacterAt(position);
    });
    return annotations;
  }

  getIndexesByRange(range, label = null) {
    var indexArr = [];
    for (let i = 0; i < this.annotations.length; i++) {
      if (label) {
        if (label !== this.annotations[i].label) {
          continue;
        }
      }
      if (range.startPosition - 2 <= this.annotations[i].range.endPosition && range.endPosition >= this.annotations[i].range.endPosition) {
        indexArr.push(i);
      } else if (range.endPosition + 2 >= this.annotations[i].range.startPosition && range.endPosition <= this.annotations[i].range.endPosition) {
        indexArr.push(i);
      } else if (range.startPosition >= this.annotations[i].range.startPosition && range.endPosition <= this.annotations[i].range.endPosition) {
        indexArr.push(i);
      }
    }
    return indexArr;
  }

  getAnnotationIndex(annotation) {
    for (let i = 0; i < this.annotations.length; i++) {
      if (annotation === this.annotations[i]) {
        return i;
      }
    }
    return -1;
  }

  deleteByRange(range, label) {
    let indexes = this.getIndexesByRange(range, label);
    console.log(indexes);
    let push = [];
    for (let i = indexes.length - 1; i >= 0; i--) {
      // if (range.startPosition >= this.annotations[indexes[i]].range.startPosition && range.endPosition <= this.annotations[indexes[i]].range.endPosition) {
        if (range.startPosition > this.annotations[indexes[i]].range.startPosition) {
          var range1 = {
            startPosition: this.annotations[indexes[i]].range.startPosition,
            endPosition: range.startPosition
          };
          var content1 = this.annotations[indexes[i]].content.substring(0, range.startPosition - this.annotations[indexes[i]].range.startPosition);
          push.push(new Annotation(range1, content1, label));
        }
        if (range.endPosition < this.annotations[indexes[i]].range.endPosition) {
          var range2 = {
            startPosition: range.endPosition,
            endPosition: this.annotations[indexes[i]].range.endPosition
          };
          var content2 = this.annotations[indexes[i]].content.substring(range.endPosition - this.annotations[indexes[i]].range.startPosition, this.annotations[indexes[i]].content.length);
          push.push(new Annotation(range2, content2, label));
        }
      // }
      this.annotations.splice(indexes[i], 1);
    }
    for (let annotation of push) {
      this.annotations.push(annotation);
    };
    return;
  }

  updateAnnotationList(blacklistAnnotation) {
    this.annotations = this.annotations.filter(function (annotation) {
      return annotation !== blacklistAnnotation;
    });
  }

  // push element into sorted position // merge if we can // returns -1 if pushed // returns index if already belongs
  sortedPush(annotation) {
    // get overlapping
    let indexes = this.getIndexesByRange(annotation.range, annotation.label);
    var newAnno = annotation;
    // merge overlapping
    for (let i = 0; i < indexes.length; i++) {
      newAnno = this.compareAnnotations(newAnno, this.annotations[indexes[i]]);
    }
    // remove old highlights
    for (let i = indexes.length - 1; i >= 0; i--) {
      this.annotations.splice(indexes[i], 1);
    }
    // push new highlight to correct index
    for (let i = 0; i < this.annotations.length; i++) {
      if (newAnno.range.startPosition < this.annotations[i].range.startPosition) {
        this.annotations.splice(i, 0, newAnno);
        return i;
      }
    }
    // got to the end // just push
    this.annotations.push(newAnno);
    return this.annotations.length - 1;
  }

  compareAnnotations(a, b) {
    // smaller start position
    if (a.range.startPosition < b.range.startPosition) {
      // smaller end position // replace
      if (a.range.endPosition >= b.range.endPosition) {
        return a;
      }
      // greater end position than start // merge
      return this.mergeAnnotations(a, b);
    }

    // greater or equal start position
    // smaller end position // encapsulated
    if (a.range.endPosition <= b.range.endPosition) {
      return b;
    }
    // greater end postion // merge
    if (a.range.endPosition > b.range.endPosition) {
      return this.mergeAnnotations(b, a);
    }
  }

  mergeAnnotations(a, b) {
    var range = {
      startPosition: a.range.startPosition,
      endPosition: b.range.endPosition
    };
    let difference = a.range.endPosition - a.range.startPosition;
    var content = a.content;
    if (difference < 0) {
      content = a.content;
      for (let i = difference; i < 0; i++) {
        content += " ";
      }
      content += b.content;
    } else {
      content += b.content.substring(difference);
    }

    return new Annotation(range, content, a.label);
  }
}
