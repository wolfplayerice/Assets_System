from django.urls import path
from . import views
app_name = 'category'
urlpatterns = [
    path("", views.category, name="category"),
    path('list_category/', views.list_category, name='list_category'),
    path('create_category/', views.category_create, name='create_category'),
    path('delete_category/<int:category_id>/', views.delete_category, name='delete_category'),
    path('category_edit/<int:cat_id>/', views.category_edit, name='category_edit')
    ]