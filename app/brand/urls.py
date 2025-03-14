from django.urls import path
from . import views
app_name = 'brand'
urlpatterns = [
    path("", views.brand, name="brand"),
    path('list_brand/', views.list_brand, name='list_brand')
]