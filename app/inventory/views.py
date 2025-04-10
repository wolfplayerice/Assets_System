from django.shortcuts import render, get_object_or_404
from django.http.response import JsonResponse, HttpResponse
from .models import Asset
from brand.models import Brand
from category.models import Category
from .forms import AssetCreate, AssetEdit
from django.urls import reverse
from django.db import IntegrityError
from django.core.paginator import Paginator, EmptyPage
from django.contrib.auth.decorators import login_required
from audit.models import AuditLog 
from django.db.models import Q

@login_required
def inventory(request):
    asset_create_form = AssetCreate()
    asset_edit_form = AssetEdit()
    categories = Category.objects.all()
    brands = Brand.objects.all()
    return render(request, 'crudassets.html', { 
        'categories': categories,
        'brands': brands,
        'form': asset_create_form,
        'edit_form': asset_edit_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'list_assets_url': reverse('inventory:list_assets'),
        })


@login_required
def list_assets(request):
    status_filter = request.GET.get('status', 'all')
    categories = request.GET.getlist('categories[]', [])
    brand = request.GET.getlist('brand[]', [])
    all_data = request.GET.get('all', False)

    order_column_index = request.GET.get('order[0][column]', '0')
    order_direction = request.GET.get('order[0][dir]', 'asc')
    

    column_map = {
        '0': 'id',
        '1': 'fk_brand__name',
        '2': 'model',
        '3': 'fk_category__name',
        '4': 'serial_number',
        '5': 'state_asset',
        '6': 'status',
    }
    
    order_field = column_map.get(order_column_index, 'id')

    assets = Asset.objects.all()

    if status_filter != 'all':
        assets = assets.filter(status=status_filter)

    if categories and 'all' not in categories:
        assets = assets.filter(fk_category_id__in=categories)

    if brand and 'all' not in brand:
        assets = assets.filter(fk_brand_id__in=brand)


    if order_direction == 'desc':
        order_field = f'-{order_field}'
    assets = assets.order_by(order_field)

    if all_data:
        data = [asset.to_dict() for asset in assets]
        return JsonResponse({'Asset': data})


    try:
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid parameters'}, status=400)


    search_value = request.GET.get('search[value]', '').strip().lower()
    if search_value:

            status_mapping = {
                'operativo': True,
                'inoperativo': False
            }
            
            status_filter = None
            for term, bool_value in status_mapping.items():
                if term.startswith(search_value):
                    status_filter = bool_value
                    break

            assets = assets.filter(
            Q(model__icontains=search_value) |
            Q(serial_number__icontains=search_value) |
            Q(state_asset__icontains=search_value) |
            Q(fk_brand__name__icontains=search_value) |
            Q(fk_category__name__icontains=search_value) |
            (Q(status=status_filter) if status_filter is not None else Q())
        )

    total_records = assets.count()
    filtered_records = assets.count()


    paginator = Paginator(assets, length)
    page_number = (start // length) + 1

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        page_obj = paginator.page(1)

    data = [asset.to_dict() for asset in page_obj]

    return JsonResponse({
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': filtered_records,
        'data': data,
    })

@login_required
def asset_create(request):
    if request.method == "POST":
        asset_create_form = AssetCreate(request.POST)
        if asset_create_form.is_valid():
            try:
                prefix = asset_create_form.cleaned_data['prefix']
                state_asset = asset_create_form.cleaned_data['state_asset']
                full_st = f"{prefix}{state_asset}"
                state_asset = full_st

                assets = Asset(
                    model=asset_create_form.cleaned_data['model'],
                    serial_number=asset_create_form.cleaned_data['serial_number'],
                    state_asset=full_st,
                    status=asset_create_form.cleaned_data['status'],
                    observation=asset_create_form.cleaned_data['observation'],
                    fk_category=asset_create_form.cleaned_data['fk_category'],
                    fk_brand=asset_create_form.cleaned_data['fk_brand'],
                )
                assets.save()
                AuditLog.objects.create(
                    user=request.user,
                    action='create',
                    username=request.user.username,  
                    model_name='Asset',
                    object_id=assets.id,
                    description=f"Activo creado (ID: {assets.id}): {assets.fk_brand.name} {assets.model} {assets.serial_number}"
                )
                return JsonResponse({'status': 'success', 'message': 'El activo se ha guardado correctamente.'})
            
            except IntegrityError as e:
                if 'serial_number' in str(e):
                    return JsonResponse({'status': 'error', 'message': 'Error: El número de serie ya existe. Por favor, ingrese un número de serie único.'})
                else:
                    return JsonResponse({'status': 'error', 'message': 'Error: Ocurrió un problema al guardar el activo. Por favor, inténtelo de nuevo.'})
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        
        else:
            errors = []
            for field, error_list in asset_create_form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
    
    else:
        asset_create_form = AssetCreate()
    
    return render(request, 'index.html', {
        'form': asset_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })

@login_required
def delete_asset(request, asset_id):
    print(f"Received request method: {request.method}")  
    if request.method == "DELETE":
        try:
            asset = Asset.objects.get(pk=asset_id)
            asset.delete()
            AuditLog.objects.create(
                    user=request.user,
                    action='delete',
                    username=request.user.username,  
                    model_name='Asset',
                    object_id=asset_id,
                    description=f"Activo eliminado (ID: {asset_id}): {asset.fk_brand.name} {asset.model} {asset.serial_number}"
                )
            return JsonResponse({"message": "Bien eliminado correctamente."})
        except Asset.DoesNotExist:
            return JsonResponse({"error": "Bien no encontrado."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  

@login_required
def asset_edit(request, asset_id):
    asset = get_object_or_404(Asset, pk=asset_id)
    FIELD_NAMES = {
        'model': 'Modelo',
        'serial_number': 'Número de serie',
        'state_asset': 'Bien de estado',
        'status': 'Estatus',
        'observation': 'Observaciones',
        'fk_category': 'Categoría',
        'fk_brand': 'Marca'
    }

    if request.method == "POST":
        form = AssetEdit(request.POST, instance=asset)
        if form.is_valid():
            try:
                # 1. Capturar valores ANTES de guardar
                original_asset = Asset.objects.get(pk=asset.id)
                old_values = {
                    'model': original_asset.model,
                    'serial_number': original_asset.serial_number,
                    'state_asset': original_asset.state_asset,
                    'status': original_asset.status,
                    'observation': original_asset.observation,
                    'fk_category': original_asset.fk_category,
                    'fk_brand': original_asset.fk_brand
                }

                # 2. Procesar prefijo y número
                prefix = form.cleaned_data.get('prefix', 'BE-').rstrip('-')
                number = form.cleaned_data.get('state_asset', '').strip()
                
                if not number:
                    return JsonResponse({'status': 'error', 'message': 'El número del activo no puede estar vacío.'})
                
                # 3. Validar número de serie
                serial = form.cleaned_data.get('serial_number', '').strip()
                if serial:
                    existing_asset = Asset.objects.filter(serial_number=serial).exclude(pk=asset_id).first()
                    if existing_asset:
                        return JsonResponse({'status': 'error', 'message': f'El número de serie {serial} ya está asignado al activo {existing_asset.state_asset}'})
                
                # 4. Construir state_asset completo
                full_st = f"{prefix}-{number}"
                
                # 5. Actualizar el activo
                updated_asset = form.save(commit=False)
                updated_asset.state_asset = full_st
                updated_asset.save()

                # 6. Obtener nuevos valores
                updated_asset.refresh_from_db()
                new_values = {
                    'model': updated_asset.model,
                    'serial_number': updated_asset.serial_number,
                    'state_asset': updated_asset.state_asset,
                    'status': updated_asset.status,
                    'observation': updated_asset.observation,
                    'fk_category': updated_asset.fk_category,
                    'fk_brand': updated_asset.fk_brand
                }
                
                # 7. Detectar cambios (CORRECCIÓN PRINCIPAL)
                changes = []
                for field in old_values:
                    old_val = old_values[field]
                    new_val = new_values[field]
                    
                    if str(old_val) != str(new_val):
                        field_name = FIELD_NAMES.get(field, field)
                        if field in ['fk_category', 'fk_brand']:
                            changes.append(f"{field_name}: '{old_val.name if old_val else 'Ninguno'}' → '{new_val.name if new_val else 'Ninguno'}'")
                        else:
                            changes.append(f"{field_name}: '{old_val}' → '{new_val}'")

                # 8. Crear mensaje de auditoría
                if changes:
                    changes_str = "; ".join(changes)
                    audit_message = f"Actualización de activo {updated_asset.state_asset} (ID: {updated_asset.id}): {changes_str}"
                else:
                    audit_message = f"Activo {updated_asset.state_asset} (ID: {updated_asset.id}) editado sin cambios significativos."

                # 9. Registrar auditoría
                AuditLog.objects.create(
                    user=request.user,
                    action='update',
                    model_name='Asset',
                    object_id=asset.id,
                    description=audit_message
                )
                
                return JsonResponse({'status': 'success', 'message': 'El activo se ha actualizado correctamente.'})
            
            except IntegrityError as e:
                if 'serial_number' in str(e):
                    return JsonResponse({'status': 'error', 'message': 'Error: El número de serie ya existe. Por favor, ingrese un número de serie único.'})
                else:
                    return JsonResponse({'status': 'error', 'message': 'Error: Ocurrió un problema al actualizar el activo. Por favor, inténtelo de nuevo.'})
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': f'Error inesperado: {str(e)}'})
        
        else:
            errors = []
            for field, error_list in form.errors.items():
                for error in error_list:
                    errors.append(f'Error en el campo: {error}')
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
    
    else:
        initial_data = {}
        if asset.state_asset:
            parts = asset.state_asset.split('-', 1)
            initial_data = {
                'prefix': parts[0] + '-' if len(parts) > 1 else 'BE-',
                'state_asset': parts[1] if len(parts) > 1 else parts[0]
            }
        form = AssetEdit(instance=asset, initial=initial_data)
    
    return render(request, 'crudassets.html', {
        'edit_form': form,
        'asset_id': asset_id,
    })