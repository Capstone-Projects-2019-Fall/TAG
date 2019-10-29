from django.urls import path
from mldata import views

urlpatterns = [
    path('', views.index, name='index'),
    # path('/index', views.index, name='index'),
    # path('/APItest', views.APItest, name='APItest'),
]