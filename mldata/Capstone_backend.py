import json
import os
import argparse
import sys
import random
from pathlib import Path
import spacy
import re
import string
from spacy.util import minibatch, compounding

class documentClass:
    def __init__(self, title, text, annotations):
        self.title = title
        self.text = text
        self.annotations = annotations

class annotationClass:
    def __init__(self, label, start, end, content):
        self.range = {'startPosition': start, 'endPosition': end}
        self.content = content
        self.label = label

def data_converting(data):

    final_data = []; label_set = set()
    for d in data:
        if d['annotations'].count != 0:
            temp = {'entities':[]}
            for anno in d['annotations']:
                temp['entities'].append((int(anno['range']['startPosition']), int(anno['range']['endPosition']), anno['label']))
                label_set.add(anno['label'])
                final_data.append((d['text'],temp))
    return final_data, label_set

def main(data):
    # nlp = spacy.load(model)  # load existing spaCy model
    nlp = spacy.load('en_core_web_sm')
    # print("Loaded model '%s'" % model)
    docs = []
    for d in data:
        doc = nlp(d['text'])
        returnData = []
        for ent in doc.ents:
            annotation = annotationClass(ent.label_, ent.start_char, ent.end_char, ent.text)
            print("Found entity: %s in %s" % (ent.text, d['title']))
            returnData.append(annotation.__dict__)
        docs.append(documentClass(d['title'], d['text'], returnData).__dict__)
        # print("Found %d entities", doc.ents.count)
    return json.dumps(docs)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--model_output_dir',
        help="Path to the directory to output the trained models to"
    )

    parser.add_argument(
        '--data_path',
        help="Path to the data directory."
    )


    parser.add_argument(
        '--iterations',
        type=int,
        help="Number of iterations to run."
    )
    parser.add_argument(
        '--Model',
        default=None,
        help="Number of iterations to run."
    )


    args = parser.parse_args()
    main(args.model_output_dir,
              args.data_path,
              args.iterations,
              args.Model)
