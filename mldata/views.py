from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from mldata.Capstone_backend import main, data_converting
from django.shortcuts import render
import time


@csrf_exempt
def index(request):
    # get request
    if request.method == 'GET':
        noInputResponse = 'Welcome to the our totally working api! \n'
        noInputResponse += 'To use our API, send a POST request with a JSON file attached as "jsonUpload" in form data'
        return HttpResponse(noInputResponse)
    # post request
    elif request.method == 'POST':
        startTime = time.time()
        # get file
        xfile = request.FILES['jsonUpload']
        # did get input
        # prepare data
        try:
            data = json.loads(xfile.read())
        except json.decoder.JSONDecodeError:
            return HttpResponse('Json formatted incorrectly! Please fix then try again!')

        print("Preparing to run main Capstone_backend (spacy stuff)")

        # Launch Pretrained Model Annotation
        outputFromML = main(data)
        endTime = time.time()
        print("Elapsed Time: " + str(endTime-startTime))

        return HttpResponse(outputFromML, content_type='application/json')