from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from .models import Brand
# Create your views here.


def brand(request):
    return render(request, 'crudbrand.html')

def list_brand(request):
    brands = list(Brand.objects.values())
    data = {'Brand': brands}
    return JsonResponse(data)

def delete_brand(request, brand_id):
    print(f"Received request method: {request.method}")  # Para depuración
    if request.method == "DELETE":
        try:
            brand = Brand.objects.get(pk=brand_id)
            brand.delete()
            return JsonResponse({"message": "Categoría eliminada correctamente."})
        except Brand.DoesNotExist:
            return JsonResponse({"error": "Categoría no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido