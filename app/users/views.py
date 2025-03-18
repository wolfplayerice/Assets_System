from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy

# Create your views here.

class UserListView(ListView):
    model = User
    template_name = 'user_list.html'
    context_object_name = 'users'

# Crear un nuevo usuario
class UserCreateView(CreateView):
    model = User
    form_class = UserCreationForm
    template_name = 'user_form.html'
    success_url = reverse_lazy('user_list')

# Editar un usuario existente
class UserUpdateView(UpdateView):
    model = User
    form_class = UserChangeForm
    template_name = 'user_form.html'
    success_url = reverse_lazy('user_list')

# Eliminar un usuario
class UserDeleteView(DeleteView):
    model = User
    template_name = 'user_confirm_delete.html'
    success_url = reverse_lazy('user_list')