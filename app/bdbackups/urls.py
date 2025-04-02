from django.urls import path
from . import views
app_name='backup'

urlpatterns = [
    path('', views.backup_list, name='backup_list'),
    path('list/', views.list_backups, name='list_backups'),
    path('create/', views.create_backup, name='create_backup'),
    path('restore/', views.restore_backup, name='restore_backup'),
    path('delete/', views.delete_backup, name='delete_backup'),
]