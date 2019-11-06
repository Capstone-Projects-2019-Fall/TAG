//jshint esversion:6

class Doc {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.annotations = [];
  }

  // get all annotations at this position
  getAnnotationsAtPos(position) {
    let annotations = this.annotations.filter(function (annotation) {
      return annotation.containsCharacterAt(position);
    });
    return annotations;
  }

  // get all indices contained within the range // if label specified, only include those with that label
  getIndicesByRange(range, label = null) {
    var indexArr = [];
    // check all indices
    for (let i = 0; i < this.annotations.length; i++) {
      let current = this.annotations[i];
      // label specifier
      if (label) {
        // exclude those that don't belong to label
        if (label !== current.label) {
          continue;
        }
      }
      // current's end position within
      if (range.startPosition <= current.range.endPosition && range.endPosition >= current.range.endPosition) {
        indexArr.push(i);
      } 
      // current's start position within
      else if (range.endPosition >= current.range.startPosition && range.endPosition <= current.range.endPosition) {
        indexArr.push(i);
      } 
      // current encompasses range
      else if (range.startPosition >= current.range.startPosition && range.endPosition <= current.range.endPosition) {
        indexArr.push(i);
      }
    }
    return indexArr;
  }

  // get the index of the annotation
  getAnnotationIndex(annotation) {
    // check all indices
    for (let i = 0; i < this.annotations.length; i++) {
      // found // return index
      if (annotation === this.annotations[i]) {
        return i;
      }
    }
    // didn't find // return out of bound index
    return -1;
  }

  // remove range from annotations (only for the specified label) // splits if necessary
  deleteByRange(range, label) {
    // get all indices that range belongs in
    let indices = this.getIndicesByRange(range, label);
    // array of new annotations to add
    let push = [];
    // check all marked indices (back to front to prevent mispositioning when deleting)
    for (let i = indices.length - 1; i >= 0; i--) {
      let current = this.annotations[indices[i]];
      // deleting range leaves a head
      if (range.startPosition > current.range.startPosition) {
        // new range to add
        var range1 = {
          startPosition: current.range.startPosition,
          endPosition: range.startPosition
        };
        // new content
        var content1 = current.content.substring(0, range.startPosition - current.range.startPosition);
        push.push(new Annotation(range1, content1, label));
      }
      // range range leaves a tail
      if (range.endPosition < current.range.endPosition) {
        // new range to add
        var range2 = {
          startPosition: range.endPosition,
          endPosition: current.range.endPosition
        };
        // new content
        var content2 = current.content.substring(range.endPosition - current.range.startPosition);
        push.push(new Annotation(range2, content2, label));
      }
      // remove current annotation
      this.annotations.splice(indices[i], 1);
    }
    // add remaining annotations
    for (let annotation of push) {
      this.annotations.push(annotation);
    };
    return;
  }

  // remove specfic annotation
  updateAnnotationList(blacklistAnnotation) {
    this.annotations = this.annotations.filter(function (annotation) {
      return annotation !== blacklistAnnotation;
    });
  }

  // push element into sorted position // merge if can // returns index
  sortedPush(annotation) {
    // get overlapping indices
    let indices = this.getIndicesByRange(annotation.range, annotation.label);
    var newAnno = annotation;
    // merge overlapping or adjacent
    for (let i = 0; i < indices.length; i++) {
      newAnno = this.compareAnnotations(newAnno, this.annotations[indices[i]]);
    }
    // remove old highlights (starts from back to prevent mispositioning)
    for (let i = indices.length - 1; i >= 0; i--) {
      this.annotations.splice(indices[i], 1);
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

  // compare annotations and specify how to merge
  compareAnnotations(a, b) {
    // smaller start position
    if (a.range.startPosition < b.range.startPosition) {
      // greater end position // encapsulated
      if (a.range.endPosition >= b.range.endPosition) {
        return a;
      }
      // greater end position than start // merge
      return this.mergeAnnotations(a, b);
    }

    // greater start position
    // smaller end position // encapsulated
    if (a.range.endPosition <= b.range.endPosition) {
      return b;
    }
    // greater end postion // merge
    if (a.range.endPosition > b.range.endPosition) {
      return this.mergeAnnotations(b, a);
    }
  }

  // do merging (assumes a starts before b starts and ends before b ends)
  mergeAnnotations(a, b) {
    // get a's start and b's end
    var range = {
      startPosition: a.range.startPosition,
      endPosition: b.range.endPosition
    };
    // get the difference between a's end and b's start 
    let difference = b.range.startPosition - a.range.endPosition;
    console.log(difference);
    // create content with spaces
    var content = a.content + b.content.substring(difference);

    return new Annotation(range, content, a.label);
  }
}
