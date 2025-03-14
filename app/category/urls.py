from django.urls import path
from . import views
app_name = 'category'
urlpatterns = [
    path("", views.category, name="category"),
    path('list_category/', views.list_category, name='list_category')
]