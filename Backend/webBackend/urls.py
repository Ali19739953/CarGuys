"""
URL configuration for webBackend project.
"""
from django.contrib import admin
from django.urls import path    #function is used to define URL patterns in Django.
from .import loginAuthentication
from django.urls import path,include

urlpatterns = [
     path('admin/', admin.site.urls),path('auth/', include('authentication.urls')),
     
     # Path for service seeker 

     path('service-seeker/', include('service_seeker_interface_backend.urls')),
]
