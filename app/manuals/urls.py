from django.urls import path
from . import views

urlpatterns = [
    # ... otras rutas ...
    path('manuals/', views.manuals, name='manuals'),
]