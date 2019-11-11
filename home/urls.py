from django.urls import path, include
from django.contrib import admin
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', views.home, name='home'),
    path('tag', views.tag, name='tag'),
    path('mldata', include('mldata.urls')),
]