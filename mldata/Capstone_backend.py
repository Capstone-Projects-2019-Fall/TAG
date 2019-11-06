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

def main(output_dir, data_path, n_iter, model=None):
    # """Set up the pipeline and entity recognizer, and train the new entity."""
    random.seed(0)
    train_data, labelset = data_converting(data_path)
    print("Training with: ", train_data)
    if model is not None:
        nlp = spacy.load(model)  # load existing spaCy model
        print("Loaded model '%s'" % model)
    else:
        nlp = spacy.blank("en")  # create blank Language class
        print("Created blank 'en' model")
    # Add entity recognizer to model if it's not in the pipeline
    # nlp.create_pipe works for built-ins that are registered with spaCy
    if "ner" not in nlp.pipe_names:
        ner = nlp.create_pipe("ner")
        nlp.add_pipe(ner)
    # otherwise, get it, so we can add labels to it
    else:
        ner = nlp.get_pipe("ner")
    for l in labelset:
        ner.add_label(l)

    # Adding extraneous labels shouldn't mess anything up
    if model is None:
        optimizer = nlp.begin_training()
    else:
        optimizer = nlp.resume_training()
    move_names = list(ner.move_names)
    # get names of other pipes to disable them during training
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
    with nlp.disable_pipes(*other_pipes):  # only train NER
        sizes = compounding(1.0, 4.0, 1.001)
        # batch up the examples using spaCy's minibatch
        for itn in range(n_iter):
            random.shuffle(train_data)
            batches = minibatch(train_data, size=sizes)
            losses = {}
            for batch in batches:
                texts, annotations = zip(*batch)
                nlp.update(texts, annotations, sgd=optimizer, drop=0.35, losses=losses)
                print("Losses", losses)
    # save model to output directory
    if output_dir is not None:
        output_dir = Path(output_dir)
        if not output_dir.exists():
            output_dir.mkdir()
        nlp.to_disk(output_dir)
        print("Saved model to", output_dir)

    return nlp

def test(nlp, data):
    # nlp = spacy.load(model)  # load existing spaCy model
    # print("Loaded model '%s'" % model)
    docs = []
    for d in data:
        doc = nlp(d['text'])
        returnData = []
        for ent in doc.ents:
            annotation = annotationClass(ent.label_, ent.start_char, ent.end_char, ent.text)
            print("Found entity: %d in %s", annotation.__dict__, d['title'])
            returnData.append(annotation.__dict__)
        docs.append(documentClass(d['title'], d['text'], returnData).__dict__)
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
