from django.http import HttpResponse


def home(request):
    return HttpResponse("Hello, world. You're at the TAG home page.")