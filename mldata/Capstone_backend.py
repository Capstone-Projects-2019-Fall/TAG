import json
import argparse
import spacy


class DocumentClass:
    def __init__(self, title, text, annotations):
        self.title = title
        self.text = text
        self.annotations = annotations


class AnnotationClass:
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
    nlp = spacy.load('en_core_web_sm')
    docs = []
    for d in data:
        doc = nlp(d['text'])
        return_data = []
        for ent in doc.ents:
            annotation = AnnotationClass(ent.label_, ent.start_char, ent.end_char, ent.text)
            print("Found entity: %s in %s" % (ent.text, d['title']))
            return_data.append(annotation.__dict__)
        docs.append(DocumentClass(d['title'], d['text'], return_data).__dict__)
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
