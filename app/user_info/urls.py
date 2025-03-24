from django.urls import path
from . import views

app_name= 'user_info'
urlpatterns = [
    path("", views.user_info, name="user_info")

]