from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.seeker_signup, name='seeker_signup')
   ]