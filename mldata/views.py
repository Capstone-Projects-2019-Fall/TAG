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
        no_input_response = 'Welcome to the our totally working api! \n'
        no_input_response += 'To use our API, send a POST request with a JSON file attached as "jsonUpload" in form data'
        return HttpResponse(no_input_response)
    # post request
    elif request.method == 'POST':
        start_time = time.time()
        # get file
        xfile = request.FILES['jsonUpload']
        # did get input
        # prepare data
        try:
            data = json.loads(xfile.read())
        except json.decoder.JSONDecodeError:
            return HttpResponse('Json formatted incorrectly! Please fix then try again!')

        print("Preparing to run main Capstone_backend (spacy stuff)")

        # Launch Pre-trained Model Annotation
        output_from_ml = main(data)
        end_time = time.time()
        print("Elapsed Time: " + str(end_time-start_time))

        return HttpResponse(output_from_ml, content_type='application/json')