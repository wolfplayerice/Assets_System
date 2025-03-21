from django.urls import path
from . import views
app_name = 'users'
urlpatterns = [
    path("", views.user,name='users'),
    path('list_users/', views.list_users, name='users_list'),
    ]