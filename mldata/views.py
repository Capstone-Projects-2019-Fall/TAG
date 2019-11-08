from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
# replace sorcery with machine learning program (.py)
from mldata.sorcery import magic
from mldata.Capstone_backend import main, data_converting, test
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
        #train the model!
        model = None

        # Save/Load based on checkboxes on the webpage
        if(request.POST.get("save-model") == "false" and request.POST.get("load-model") == "false"):
            model = main(None, data, 30)
            print("NOT Saving Model")
            print("Model not loaded")

        elif(request.POST.get("save-model") == "true" and request.POST.get("load-model") == "false"):
            model = main("models/", data, 30)
            print("Saving Model")
            print("Model not loaded")
        
        elif(request.POST.get("save-model") == "false" and request.POST.get("load-model") == "true"):
            model = main(None, data, 30, "models/")
            print("Loading Exising Model")
            print("Model will not be saved")
        
        elif(request.POST.get("save-model") == "true" and request.POST.get("load-model") == "true"):
            model = main("models/", data, 30, "models/")
            print("Loading Exising Model")
            print("Model will be saved")

        #test the model!
        outputFromML = test(model, data)
        #convert
        # output = json.dumps(outputFromML)
        endTime = time.time()
        print("Elapsed Time: " + str(endTime-startTime))

        return HttpResponse(outputFromML, content_type='application/json')

# def APItest(request):
#     return render(request, 'APItest.html')
