from django.urls import path
from mldata import views

urlpatterns = [
    path('', views.index, name='index'),
]