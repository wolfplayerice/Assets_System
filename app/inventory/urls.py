from django.urls import path
from . import views
app_name = 'inventory'
urlpatterns = [
    path("", views.inventory, name="inventory"),
    path('list_assets/', views.list_assets, name='list_assets'),
    path('assetcreate/', views.asset_create,name= 'asset_create')
]