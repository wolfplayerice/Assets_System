from django.urls import path
from .views import audit_log_view, logs_list
app_name='audit'

urlpatterns = [
    path('logs/', audit_log_view, name='audit_log'),
    path('logs_list/', logs_list, name='logs_list'),
]   