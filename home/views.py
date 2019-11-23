from django.shortcuts import render


def home(request):
    return render(request, 'index.html')


def tag(request):
    return render(request, 'tag.html')