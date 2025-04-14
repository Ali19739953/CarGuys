from django.urls import path
from . import views


urlpatterns = [
   
   path('garage-signup/', views.garage_signup, name='garage_signup'),
   #Same login path for garage and service seeker
   path('login/', views.login, name='login'),
   path("set-csrf/", views.set_csrf, name="set-csrf"),
]
