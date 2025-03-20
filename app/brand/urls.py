from django.urls import path
from . import views
app_name = 'brand'
urlpatterns = [
    path("", views.brand, name="brand"),
    path('list_brand/', views.list_brand, name='list_brand'),
    path('create_brand/', views.brand_create, name='create_brand'),
    path('delete_brand/<int:brand_id>/', views.delete_brand, name='delete_brand'),

]