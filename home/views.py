from django.http import HttpResponse
from django.shortcuts import render

def home(request):
    # return HttpResponse('index.html')
    return render(request, 'index.html')
