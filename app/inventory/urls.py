from django.urls import path
from . import views
app_name = 'inventory'
urlpatterns = [
    path("", views.inventory, name="inventory"),
    path('list_assets/', views.list_assets, name='list_assets'),
    path('assetcreate/', views.asset_create,name= 'asset_create'),
    path('delete_asset/<int:asset_id>/', views.delete_asset, name='delete_asset'),
]