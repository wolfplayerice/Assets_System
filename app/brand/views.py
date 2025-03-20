from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from .models import Brand
from .forms import Create_brand
from django.contrib import messages
<<<<<<< HEAD
from django.http import HttpResponseRedirect
=======

from django.contrib.auth.decorators import login_required
>>>>>>> 714d3226c99937e2d27a0273df02b8244157ddd4
# Create your views here.

@login_required
def brand(request):
<<<<<<< HEAD
    brand_create_form = Create_brand()
    return render(request, 'crudbrand.html', { 'brand_form': brand_create_form}, { 'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })
=======

        
>>>>>>> 714d3226c99937e2d27a0273df02b8244157ddd4

@login_required
def list_brand(request):
    brands = list(Brand.objects.values())
    data = {'Brand': brands}
    return JsonResponse(data)

@login_required
def brand_create(request):
    if request.method == "POST":
        brand_create_form = Create_brand(request.POST)
        if brand_create_form.is_valid():
            try:
                brands = Brand(
                    name=brand_create_form.cleaned_data['name'],
                )
                brands.save()
                messages.success(request, 'La marca se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:brand'))
            
            except Exception as e:
                # Captura cualquier otro error inesperado
                messages.error(request, f'Error inesperado: {str(e)}')
                return HttpResponseRedirect(reverse('home:brand'))
        
        else:
            # Si el formulario no es válido, muestra errores de validación
            for field, errors in brand_create_form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
                    return HttpResponseRedirect(reverse('home:brand'))
    
    else:
        brand_create_form = Create_brand()
    
<<<<<<< HEAD
    return render(request, 'crudbrand.html', {'brand_form': brand_create_form})

=======
    return render(request, 'crudbrand.html', {
        'brand_form': brand_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })

@login_required
>>>>>>> 714d3226c99937e2d27a0273df02b8244157ddd4
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