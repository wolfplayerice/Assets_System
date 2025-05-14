from django.urls import path
from . import views
app_name = 'manuals'
urlpatterns = [
    path("", views.manuals, name="manuals"),
]