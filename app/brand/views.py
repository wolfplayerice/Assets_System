from django.shortcuts import render
from django.http.response import JsonResponse
from .models import Brand
# Create your views here.


def brand(request):
    return render(request, 'crudbrand.html')

def list_brand(request):
    brands = list(Brand.objects.values())
    data = {'Brand': brands}
    return JsonResponse(data)
