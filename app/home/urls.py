from django.urls import path
from . import views
from inventory import views as inventory_views
from category import views as category_views
from brand import views as brand_views
from users import views as users_views
from user_info import views as user_info_views
from audit import views as audit_views
from bdbackups import views as bdbackups_views
from manuals import views as manuals_views

app_name= 'home'
urlpatterns = [
    path("", views.home, name="home"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("inventory/", inventory_views.inventory, name="inventory"),
    path("category/", category_views.category, name="category"),
    path("brand/", brand_views.brand, name="brand"),
    path("users/", users_views.user, name="users"),
    path("user_info/", user_info_views.user_info, name="user_info"),
    path("audit/", audit_views.audit_log_view, name="audit"),
    path("backup/", bdbackups_views.backup_list, name="backup"),
    path("manuals/", manuals_views.manuals, name="manuals"),

]