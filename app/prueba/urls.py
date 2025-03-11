from django.urls import path
from .views import check_db_connection

urlpatterns = [
    path('check-db/', check_db_connection, name='check_db'),
]