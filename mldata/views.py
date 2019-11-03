from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
# replace sorcery with machine learning program (.py)
from mldata.sorcery import magic
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
            print(data)
        except json.decoder.JSONDecodeError:
            return HttpResponse('Json formatted incorrectely! Please fix then try again!')
        jsonData = json.dumps(data)
        # return data from machine learning algorithm
        output = magic(jsonData)  # replace with machine learning algorithm
        endTime = time.time()
        print("Elapsed Time: " + str(endTime-startTime))
        return HttpResponse(output, content_type='application/json')

# def APItest(request):
#     return render(request, 'APItest.html')
