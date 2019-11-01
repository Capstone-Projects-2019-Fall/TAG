import json
import re
import string

# label and their words
class labelSet:
    def __init__(self, name):
        self.name = name
        self.words = set()      # set used for faster searches


class annotationClass:
    def __init__(self, name):
        self.name = name
        self.range = {'startPosition': None, 'endPosition': None}
        self.content = ""

    def __repr__(self):
        return '{"range":{"startPosition":' + str(self.range['startPosition']) + ',"endPosition":' + str(self.range['endPosition']) + '},"content":"' + self.content + '","label":"' + self.name + '"}'


class documentClass:
    def __init__(self, title):
        self.title = title
        self.text = None
        self.annotations = []

    def __repr__(self):
        return '{"title":"' + self.title + '","text":"' + self.text + '","annotations":' + printArr(self.annotations) + '}'

# main algorithm
def magic(input):
    documents = []
    data = json.loads(input)
    labels = []
    for document in data:
        newstring = re.sub(r'[\r\t\f\v\ ]+', ' ', document['text'])
        print(newstring)
        doc = documentClass(document['title'])                                          # parse text
        doc.text = newstring
        documents.append(doc)
        annotations = document['annotations']                                           # get annotations for document
        for annotation in annotations:
            annoLabel = annotation['label']                                             # get label name
            index = labelBelongs(labels, annoLabel)                                     # check if we have label name
            if index < 0:                                                               # not in list
                labels.append(labelSet(annoLabel))                                      # add it
                index = len(labels)-1                                                   # update index number
            annoWords = annotation['content'].split()                                   # split annotation words
            for word in annoWords:                                                      # check each word in annotation words
                cleanWord = word.strip().strip(string.punctuation)                      # remove whitespace and punctuation
                if cleanWord == 'the' or cleanWord == 'a' or cleanWord == 'an' or cleanWord == 'is':    # ignore articles
                    continue
                elif not cleanWord in labels[index].words:                              # add word if not in labels words list
                    labels[index].words.add(cleanWord)

    for doc in documents:                                                               # annotate for all documents
        print('fuck')
        for label in labels:                                                            # do each label
            coordsList = []
            for word in label.words:                                                    # check for each word
                for m in re.finditer(word, doc.text):                                   # find start and end position of all instances
                    coordsList.append((m.start(), m.end()))
            coordsList.sort(key=lambda x: x[0])                                         # sort by start position
            currentCoords = coordsList[0]                                               # starting with first annotation
            if currentCoords != None:                                                   # check to make sure there is an annotation
                for i in range(1, len(coordsList)):                                     # iterate through each annotation
                    combined = combine(currentCoords, coordsList[i])                    # combine annotation if we can
                    if combined == None:                                                # couldn't combine
                        newAnnotation = annotationClass(label.name)                     # save annotation
                        newAnnotation.range['startPosition'] = currentCoords[0]
                        newAnnotation.range['endPosition'] = currentCoords[1]
                        newAnnotation.content = doc.text[newAnnotation.range['startPosition']:newAnnotation.range['endPosition']]
                        doc.annotations.append(newAnnotation)
                        currentCoords = coordsList[i]                                   # go to next
                    else:                                                               # could combine
                        currentCoords = combined                                        # keep combined annotation
                newAnnotation = annotationClass(label.name)                             # save the last annotation
                newAnnotation.range['startPosition'] = currentCoords[0]
                newAnnotation.range['endPosition'] = currentCoords[1]
                newAnnotation.content = doc.text[newAnnotation.range['startPosition']:newAnnotation.range['endPosition']]
                doc.annotations.append(newAnnotation)
    return re.sub('\\n', '\\\\n', printArr(documents))                                     # returned stringified json

# split array with comments and surround with brackets
def printArr(arr):
    string = '['
    for thing in arr:
        string += str(thing) + ','
    if len(string) != 1:
        string = string[:-1]
    string += ']'
    return(string)

# check if label name is in array
def labelBelongs(labelArr, name):
    for index in range(len(labelArr)):
        if labelArr[index].name == name:
            return index
    return -1

# merge coordinates if within 2 spaces # one for the punctuation # one for space
# in a sorted list, this accounts for overlapping coordinates
def combine(coord1, coord2):
    if coord1[1]+2 >= coord2[0]:
        return (coord1[0], coord2[1])
    else:
        return None

## why did I do this to myself ## F ##
