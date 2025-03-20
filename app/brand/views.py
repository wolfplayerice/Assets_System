from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from .models import Brand
from .forms import BrandCreate
from django.contrib import messages
from django.shortcuts import redirect
# Create your views here.


def brand(request):
    return render(request, 'crudbrand.html')

def list_brand(request):
    brands = list(Brand.objects.values())
    data = {'Brand': brands}
    return JsonResponse(data)

def brand_create(request):
    if request.method == "POST":
        brand_create_form = BrandCreate(request.POST)
        if brand_create_form.is_valid():
            try:
                brands = Brand(
                    name=brand_create_form.cleaned_data['name'],
                )
                brands.save()
                messages.success(request, 'La marca se ha guardado correctamente.')
                return redirect('home:brand')
            
            except Exception as e:
                # Captura cualquier otro error inesperado
                messages.error(request, f'Error inesperado: {str(e)}')
                return redirect('home:brand')
        
        else:
            # Si el formulario no es válido, muestra errores de validación
            for field, errors in brand_create_form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
            return redirect('home:brand')
    
    else:
        brand_create_form = BrandCreate()
    
    return render(request, 'crudbrand.html', {'brand_form': brand_create_form})


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