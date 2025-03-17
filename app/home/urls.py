from django.urls import path
from . import views
from inventory import views as inventory_views
from category import views as category_views
from brand import views as brand_views

app_name= 'home'
urlpatterns = [
    path("", views.home, name="home"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("inventory/", inventory_views.inventory, name="inventory"),
    path("category/", category_views.category, name="category"),
    path("brands/", brand_views.brand, name="brand")
]