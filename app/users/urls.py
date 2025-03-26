from django.urls import path
from . import views
app_name = 'users'
urlpatterns = [
    path("", views.user,name='users'),
    path('list_users/', views.list_users, name='users_list'),
    path('create_user/', views.user_create, name='create_user'),
    path("user_edit/<int:user_id>/", views.user_edit, name="user_edit"),
    ]