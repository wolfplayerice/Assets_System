from django.urls import path
from . import views

app_name= 'user_info'
urlpatterns = [
    path('', views.user_info, name='user_info'),
    path('edit/<int:user_id>/', views.user_edit, name='user_edit'),
    path('get_user_data/<int:user_id>/', views.get_user_data, name='get_user_data'),
    path('user_edit/<int:user_id>/', views.user_edit, name='user_edit')

]