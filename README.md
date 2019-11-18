# TAG - Text Annotation GUI
TAG is a web-based text annotator that allows you to upload documents and highlight them using custom labels and highlight colors.
# Features
TAG has the following features
# Using Our Web Application
Our web application can currently be found [here](https://tag.pythonanywhere.com). It is currently supported on FireFox and Chrome
# Using Our Repository Locally
### Requirements
Our project requires Python3, the Django web-framework, and the spaCy natural language processor.

Python3 can be downloaded [from their website](https://www.python.org/downloads/).

Once Python is installed on your machine, you need to install pip. First, download [get-pip.py](https://bootstrap.pypa.io/get-pip.py). Then run the commands below to install verify pip has been installed
```bash
python get-pip.py
pip -V
```
To get Django and spaCy, use pip:
```bash
pip install Django
pip install -U spacy
```

```bash
git clone https://github.com/cis-cs-capstone-course/TAG.git
```

If you wish to train your own model, you will have to checkout to the training-master branch.
```bash
git checkout training-master
```

```bash
python manage.py runserver
```


