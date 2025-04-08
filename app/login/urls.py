from django.urls import path

from . import views

urlpatterns = [
    path("", views.login, name="login"),
    path("logout/", views.log_out, name="logout"),
    path("validate-security/", views.validate_security_question, name="validate_security_question"),
    path("reset-password/", views.reset_password, name="reset_password"),

]