from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from mldata.fakeSpacy import MLAlgorithm # replace fakeSpacy with machine learning program (.py)

@csrf_exempt 
def index(request):
    # get request
    if request.method == 'GET':     # remove GET request before deploying
        # try and get input from url
        input = request.GET.get('input', '')
        # no input
        # return directions to use WebAPI
        if input == '':
            noInputResponse = 'Welcome to the our totally working api! \n'
            noInputResponse += 'Add "?input=" then some json to the url to use the api! \n'
            noInputResponse += 'Or send a POST request with the file attached as "file" \n'
            return HttpResponse(noInputResponse)
        # did get input
        # prepare data
        try:
            data = json.loads(input)
        except json.decoder.JSONDecodeError:
            return HttpResponse('Json formatted incorrectely! Please fix then try again!')
        jsonData = json.dumps(data)
    # post request
    elif request.method == 'POST':
        # get file
        xfile = request.FILES['file']
        # did get input
        # prepare data
        try:
            data = json.loads(xfile.read())
        except json.decoder.JSONDecodeError:
            return HttpResponse('Json formatted incorrectely! Please fix then try again!')
        jsonData = json.dumps(data)

    # return data from machine learning algorithm
    return HttpResponse(MLAlgorithm(jsonData), content_type='application/json')