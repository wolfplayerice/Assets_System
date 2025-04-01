"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from django.conf import settings
from . import settings
from django.views.static import serve


urlpatterns = [
    path('admin/', admin.site.urls),
    path("home/", include("home.urls")),
    path("inventory/", include("inventory.urls")),
    path('', lambda request: redirect('login')),
    path("login/", include("login.urls")),
    path("brand/", include("brand.urls")),
    path("category/", include("category.urls")),
    path("users/", include("users.urls")),
    path("user_info/", include("user_info.urls")),
    path("audit/", include("audit.urls")),
    path("backup/", include("bdbackups.urls")),
    re_path(r'^static/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT})

] 
