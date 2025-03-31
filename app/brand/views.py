from django.shortcuts import render, get_object_or_404
from django.http.response import JsonResponse, HttpResponse
from .models import Brand
from .forms import Create_brand,Edit_brand
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from audit.models import AuditLog 
# Create your views here.

@login_required
def brand(request):
    brand_create_form = Create_brand()
    edit_brand_form = Edit_brand()
    return render(request, 'crudbrand.html', { 
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'brand_form': brand_create_form,
        'edit_bra_form': edit_brand_form,
        'list_brands_url': reverse('brand:list_brand'),
    })

@login_required
def list_brand(request):
    all_data = request.GET.get('all', False)

    brand = Brand.objects.all()

    data = [{
        'name': brands.name,
        'id': brands.id,
    } for brands in brand]

    if all_data:
        response_data = {
            'Brand': data,
        }
        return JsonResponse(response_data)
    draw = int(request.GET.get('draw', 0))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))  # Número de registros por página

    search_value = request.GET.get('search[value]', None)

    brand = Brand.objects.all()

    if search_value:
        brand = brand.filter(name__icontains=search_value)

    total_records = brand.count()
    filtered_records = brand.count()

    paginator = Paginator(brand, length)
    page = (start // length) + 1

    try:
        brand_page = paginator.page(page)
    except Exception:
        brand_page = paginator.page(1)

    data = [{
        'name': brand.name,
        'id': brand.id,
    } for brand in brand_page]

    response_data = {
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': filtered_records,
        'data': data,
    }

    return JsonResponse(response_data)

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
                AuditLog.objects.create(
                    user=request.user,
                    action='create',
                    username=request.user.username,
                    model_name='Brand',
                    object_id=brands.id,
                    description=f"Marca creada: {brands.name}"
                )
                messages.success(request, 'La marca se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:brand'))
            
            except Exception as e:
                # Captura cualquier otro error inesperado
                messages.error(request, f'Error inesperado: {str(e)}')
        
        else:
            # Si el formulario no es válido, muestra errores de validación
            for field, errors in brand_create_form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
    
    else:
        brand_create_form = Create_brand()
    
    return render(request, 'crudbrand.html', {'brand_form': brand_create_form}, {
        'brand_form': brand_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })

@login_required
def delete_brand(request, brand_id):
    print(f"Received request method: {request.method}")  # Para depuración
    if request.method == "DELETE":
        try:
            brand = Brand.objects.get(pk=brand_id)
            brand.delete()
            AuditLog.objects.create(
                    user=request.user,
                    action='delete',
                    username=request.user.username,  
                    model_name='Brand',
                    object_id=brand_id,
                    description=f"Marca eliminada: {brand.name}"
                )
            return JsonResponse({"message": "Categoría eliminada correctamente."})
        except Brand.DoesNotExist:
            return JsonResponse({"error": "Categoría no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido
    

@login_required
def brand_edit(request, bra_id):
    # Obtiene la marca por su ID
    brand = get_object_or_404(Brand, pk=bra_id)
    
    if request.method == "POST":  # Si el método es POST, se intenta actualizar
        form = Edit_brand(request.POST, instance=brand)  # Se asocia el formulario con la instancia de la marca
        if form.is_valid():  
            try:
                updated_brand = form.save()  
                
                AuditLog.objects.create(
                    user=request.user,
                    action='update',
                    username=request.user.username, 
                    model_name='Brand',
                    object_id=bra_id,
                    description=f"Marca editada: {updated_brand.name}"  
                )
                messages.success(request, 'La marca se ha actualizado correctamente.')
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
        else:  
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
        return HttpResponseRedirect(reverse('brand:brand')) 
    else:  
        form = Edit_brand(instance=brand)
    
    return render(request, 'crudbrand.html', {
        'edit_brand_form': form,
        'bra_id': bra_id,
    })