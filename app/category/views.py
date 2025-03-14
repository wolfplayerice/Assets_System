from django.shortcuts import render
from django.http.response import JsonResponse
from .models import Category
# Create your views here.


def category(request):
    return render(request, 'crudcat.html')

def list_category(request):
    categorys = list(Category.objects.values())
    data = {'Category': categorys}
    return JsonResponse(data)
