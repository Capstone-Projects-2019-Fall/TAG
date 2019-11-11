from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm


def home(request):
    return render(request, 'index.html')


def tag(request):
    return render(request, 'tag.html')


def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
        return redirect("tag")
    else:
        form = UserCreationForm()
    return render(request, "registration/register.html", {"form": form})


def login(request):
    if request.method == "POST":
        return redirect("tag")
    return render(request, "registration/login.html")


def logout(request):
    return render(request, "registration/logged_out.html")
