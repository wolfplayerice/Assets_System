from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('list_assets/', views.list_assets, name='list_assets')
]