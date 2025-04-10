from django.shortcuts import render, get_object_or_404
from django.http.response import JsonResponse, HttpResponse
from .models import Category
from .forms import Create_category, Edit_category
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from audit.models import AuditLog 
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

@login_required
def category(request):
    category_create_form = Create_category()
    edit_cat_form = Edit_category()
    return render(request, 'crudcat.html',{
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'cat_form': category_create_form,
        'edit_cat_form' : edit_cat_form,
        'list_category_url': reverse('category:list_category'),
        })

@login_required
def category_create(request):
    if request.method == "POST":
        category_create_form = Create_category(request.POST)
        if category_create_form.is_valid():
            name = category_create_form.cleaned_data['name'].strip()
            # Verifica si ya existe una categoría con el mismo nombre
            if Category.objects.filter(name__iexact=name).exists():
                return JsonResponse({'status': 'error', 'message': 'Ya existe una categoría con este nombre.'})
            
            try:
                category = Category(
                    name=category_create_form.cleaned_data['name'],
                    modified_by=request.user
                )
                category.save()
                
                # Registrar auditoría con más detalles
                AuditLog.objects.create(
                    user=request.user,
                    action='create',
                    model_name='Category',
                    object_id=category.id,
                    description=f"Categoría creada: {category.name} (ID: {category.id})"
                )
                return JsonResponse({'status': 'success', 'message': 'Categoría creada exitosamente.'})
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
    
    return render(request, 'crudcat.html', {
        'cat_form': Create_category(),
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def list_category(request):
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

        queryset = Category.objects.all()

        if search_value:
            queryset = queryset.filter(
                Q(name__icontains=search_value) |
                Q(id__icontains=search_value)
            )

        queryset = queryset.order_by(order_field)

        if all_data:
            data = [{
                'name': category.name,
                'id': category.id,
            } for category in queryset]
            
            return JsonResponse({
                'Category': data,
                'success': True
            })

        paginator = Paginator(queryset, length)
        page_number = (start // length) + 1

        try:
            page = paginator.page(page_number)
        except EmptyPage:
            page = paginator.page(1)

        data = [{
            'name': category.name,
            'id': category.id,
        } for category in page]

        response_data = {
            'draw': draw,
            'recordsTotal': Category.objects.count(),
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
def delete_category(request, category_id):
    if request.method == "DELETE":
        try:
            category = get_object_or_404(Category, pk=category_id)
            category_name = category.name
            category.delete()
                
            AuditLog.objects.create(
                user=request.user,
                action='delete',
                model_name='Category',
                object_id=category_id,
                description=f"Categoría eliminada: {category_name} (ID: {category_id})"
            )
                
            return JsonResponse({
                    "message": "Categoría eliminada correctamente.",
                    "status": "success"
                })
        
        except Exception as e:
            return JsonResponse({
                "error": str(e),
                "status": "error"
            }, status=500)
    
    return HttpResponse(status=405)

@login_required
def category_edit(request, cat_id):
    category = get_object_or_404(Category, pk=cat_id)
    
    if request.method == "POST":
        form = Edit_category(request.POST, instance=category)
        if form.is_valid():
            name = form.cleaned_data['name'].strip()
            # Verifica si ya existe otra categoría con el mismo nombre
            if Category.objects.filter(name__iexact=name).exclude(pk=cat_id).exists():
                return JsonResponse({'status': 'error', 'message': 'Ya existe una categoría con este nombre.'})  
            
            try:
                # Capturar valores antiguos
                original_cat = Category.objects.get(pk=cat_id)
                old_value= original_cat.name
                # Guardar cambios
                form.save()

                updated_cat = form.instance
                new_value = updated_cat.name
                
                # Detectar cambios
                changes = []
                if old_value != new_value:
                    changes.append(f"Nombre: '{old_value}' cambio a '{new_value}'")
                
                # Crear mensaje de auditoría
                if changes:
                    changes_str = "; ".join(changes)
                    audit_message = f"Categoría actualizada (ID: {cat_id}): {changes_str}"
                else:
                    audit_message = f"Categoría (ID: {cat_id}) editada sin cambios significativos"
                
                # Registrar auditoría
                AuditLog.objects.create(
                    user=request.user,
                    action='update',
                    model_name='Category',
                    object_id=cat_id,
                    description=audit_message
                )
                return JsonResponse({'status': 'success', 'message': 'La categoría se ha actualizado correctamente.'})
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        
        else:
            errors = []
            for field, error_list in form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})  
    else:
        form = Edit_category(instance=category)
    
    return render(request, 'crudcat.html', {
        'edit_cat_form': form,
        'cat_id': cat_id,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })