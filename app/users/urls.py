from django.urls import path
from . import views
app_name = 'user'
urlpatterns = [
    path("", views.user,name='user'),
    path('list_users/', views.list_users, name='users_list'),
    ]