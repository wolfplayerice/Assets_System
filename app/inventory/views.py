from django.shortcuts import render, get_object_or_404
from django.http.response import JsonResponse, HttpResponse
from .models import Asset
from brand.models import Brand
from category.models import Category
from django.http import HttpResponseRedirect
from .forms import AssetCreate, AssetEdit
from django.urls import reverse
from django.contrib import messages
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

    assets = Asset.objects.all()

    if status_filter != 'all':
        assets = assets.filter(status=status_filter)

    if categories and 'all' not in categories:
        assets = assets.filter(fk_category_id__in=categories)

    if brand and 'all' not in brand:
        assets = assets.filter(fk_brand_id__in=brand)

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
            # Mapeo de términos de búsqueda a valores booleanos
            status_mapping = {
                'operativo': True,
                'inoperativo': False
            }
            
            # Verificar si la búsqueda coincide con algún estado
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
                    model_name='Asset',
                    object_id=assets.id,
                    description=f"Activo creado: {assets.fk_brand.name} {assets.model} {assets.serial_number}"
                )
                messages.success(request, 'El activo se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:inventory'))
            
            except IntegrityError as e:
                if 'serial_number' in str(e):
                    messages.error(request, 'Error: El número de serie ya existe. Por favor, ingrese un número de serie único.')
                    return HttpResponseRedirect(reverse('home:inventory'))
                else:
                    messages.error(request, 'Error: Ocurrió un problema al guardar el activo. Por favor, inténtelo de nuevo.')
                    return HttpResponseRedirect(reverse('home:inventory'))
            
            except Exception as e:
                # Captura cualquier otro error inesperado
                messages.error(request, f'Error inesperado: {str(e)}')
                return HttpResponseRedirect(reverse('home:inventory'))
        
        else:
            # Si el formulario no es válido, muestra errores de validación
            for field, errors in asset_create_form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
                    return HttpResponseRedirect(reverse('home:inventory'))
    
    else:
        asset_create_form = AssetCreate()
    
    return render(request, 'index.html', {
        'form': asset_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        })

@login_required
def delete_asset(request, asset_id):
    print(f"Received request method: {request.method}")  # Para depuración
    if request.method == "DELETE":
        try:
            asset = Asset.objects.get(pk=asset_id)
            asset.delete()
            AuditLog.objects.create(
                    user=request.user,
                    action='delete',
                    model_name='Asset',
                    object_id=asset_id,
                    description=f"Activo eliminado: {asset.fk_brand.name} {asset.model} {asset.serial_number}"
                )
            return JsonResponse({"message": "Categoría eliminada correctamente."})
        except Asset.DoesNotExist:
            return JsonResponse({"error": "Categoría no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido

@login_required
def asset_edit(request, asset_id):
    asset = get_object_or_404(Asset, pk=asset_id)
    if request.method == "POST":
        form = AssetEdit(request.POST, instance=asset)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'El activo se ha actualizado correctamente.')
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'Error en el campo {field}: {error}')
        return HttpResponseRedirect(reverse('inventory:inventory'))
    else:
        form = AssetEdit(instance=asset)
    return render(request, 'crudassets.html', {
        'edit_form': form,
        'asset_id': asset_id,
    })