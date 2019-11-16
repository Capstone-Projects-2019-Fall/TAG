from django.shortcuts import render


def home(request):
    return render(request, 'index.html')


def tag(request):
    return render(request, 'tag.html')

def tag2(request):
    return render(request, 'tag2.html')
