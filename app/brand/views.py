from django.shortcuts import render, get_object_or_404
from django.http.response import JsonResponse, HttpResponse
from .models import Brand
from .forms import Create_brand, Edit_brand
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from audit.models import AuditLog 
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

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
    try:
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
        search_value = request.GET.get('search[value]', '').strip()
        all_data = request.GET.get('all', 'false').lower() == 'true'

        order_column_index = request.GET.get('order[0][column]', '0')
        order_direction = request.GET.get('order[0][dir]', 'asc')
        
        column_map = {
            '0': 'id',
            '1': 'name',
        }
        
        order_field = column_map.get(order_column_index, 'id')
        if order_direction == 'desc':
            order_field = f'-{order_field}'

        queryset = Brand.objects.all()

        if search_value:
            queryset = queryset.filter(
                Q(name__icontains=search_value) |
                Q(id__icontains=search_value)
            )

        queryset = queryset.order_by(order_field)

        if all_data:
            data = [{
                'name': brand.name,
                'id': brand.id,
            } for brand in queryset]
            
            return JsonResponse({
                'Brand': data,
                'success': True
            })

        paginator = Paginator(queryset, length)
        page_number = (start // length) + 1

        try:
            page = paginator.page(page_number)
        except EmptyPage:
            page = paginator.page(1)

        data = [{
            'name': brand.name,
            'id': brand.id,
        } for brand in page]

        response_data = {
            'draw': draw,
            'recordsTotal': Brand.objects.count(),
            'recordsFiltered': paginator.count, 
            'data': data,
            'success': True
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'success': False
        }, status=500)

@login_required
def brand_create(request):
    if request.method == "POST":
        brand_create_form = Create_brand(request.POST)
        if brand_create_form.is_valid():
            name = brand_create_form.cleaned_data['name'].strip()
            # Verifica si ya existe una marca con el mismo nombre
            if Brand.objects.filter(name__iexact=name).exists():
                return JsonResponse({'status': 'error', 'message': 'Ya existe una marca con este nombre.'})
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
                return JsonResponse({'status': 'success', 'message': 'Marca creada exitosamente.'})
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        
        else:
            errors = []
            for field, error_list in brand_create_form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo {field}: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
    
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
            return JsonResponse({"message": "Marca eliminada correctamente."})
        except Brand.DoesNotExist:
            return JsonResponse({"error": "Marca no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": "Esta Marca tiene bienes asociados"}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido
    

@login_required
def brand_edit(request, bra_id):
    # Obtiene la marca por su ID
    brand = get_object_or_404(Brand, pk=bra_id)
    
    if request.method == "POST":  # Si el método es POST, se intenta actualizar
        form = Edit_brand(request.POST, instance=brand)  # Se asocia el formulario con la instancia de la marca
        if form.is_valid():
            name = form.cleaned_data['name'].strip()
            # Verifica si ya existe otra marca con el mismo nombre
            if Brand.objects.filter(name__iexact=name).exclude(pk=bra_id).exists():
                return JsonResponse({'status': 'error', 'message': 'Ya existe una marca con este nombre.'})  
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
                return JsonResponse({'status': 'success', 'message': 'La marca se ha actualizado correctamente.'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        else:
            errors = []
            for field, error_list in form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})  

    else:  
        form = Edit_brand(instance=brand)
    
    return render(request, 'crudbrand.html', {
        'edit_brand_form': form,
        'bra_id': bra_id,
    })