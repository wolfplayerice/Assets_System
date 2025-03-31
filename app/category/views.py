from django.shortcuts import render, get_object_or_404
from django.http.response import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from .models import Category
from .forms import Create_category, Edit_category
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from audit.models import AuditLog 
from django.db import IntegrityError
# Create your views here.

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
                
                messages.success(request, 'La categoría se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:category'))
            
            except IntegrityError as e:
                messages.error(request, 'Error: Ya existe una categoría con este nombre.')
            
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
    
    return render(request, 'crudcat.html', {
        'cat_form': Create_category(),
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })

@login_required
def list_category(request):
    all_data = request.GET.get('all', False)

    categories = Category.objects.all()

    data = [{
        'name': category.name,
        'id': category.id,
    } for category in categories]

    if all_data:
        response_data = {
            'Category': data,
        }
        return JsonResponse(response_data)
    draw = int(request.GET.get('draw', 0))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))  # Número de registros por página

    search_value = request.GET.get('search[value]', None)

    categories = Category.objects.all()

    if search_value:
        categories = categories.filter(name__icontains=search_value)

    total_records = categories.count()
    filtered_records = categories.count()

    paginator = Paginator(categories, length)
    page = (start // length) + 1

    try:
        categories_page = paginator.page(page)
    except Exception:
        categories_page = paginator.page(1)

    data = [{
        'name': category.name,
        'id': category.id,
    } for category in categories_page]

    response_data = {
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': filtered_records,
        'data': data,
    }

    return JsonResponse(response_data)

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
                
                messages.success(request, 'La categoría se ha actualizado correctamente.')
            
            except IntegrityError as e:
                messages.error(request, 'Error: Ya existe una categoría con este nombre.')
            
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
        
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
        
        return HttpResponseRedirect(reverse('category:category'))
    
    else:
        form = Edit_category(instance=category)
    
    return render(request, 'crudcat.html', {
        'edit_cat_form': form,
        'cat_id': cat_id,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })