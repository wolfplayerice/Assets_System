from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from .models import Asset
from django.http import HttpResponseRedirect
from .forms import AssetCreate
from django.urls import reverse
from django.contrib import messages
from django.db import IntegrityError
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
# Create your views here.

@login_required
def inventory(request):
    asset_create_form = AssetCreate()

    return render(request, 'crudassets.html', { 
        'form': asset_create_form,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'list_assets_url': reverse('inventory:list_assets'),
        })

@login_required
def list_assets(request):
    all_data = request.GET.get('all', False)

    assets = Asset.objects.all()

    # Usamos to_dict() para obtener los datos de cada asset
    data = [asset.to_dict() for asset in assets]

    if all_data:
        response_data = {
            'Asset': data,
        }
        return JsonResponse(response_data)

    try:
        draw = int(request.GET.get('draw', 0))
        start = int(request.GET.get('start', 0))
        length = int(request.GET.get('length', 10))  # Número de registros por página
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid parameters'}, status=400)

    search_value = request.GET.get('search[value]', None)

    if search_value:
        assets = assets.filter(name__icontains=search_value)

    total_records = assets.count()
    filtered_records = assets.count()

    paginator = Paginator(assets, length)
    page = (start // length) + 1

    try:
        assets_page = paginator.page(page)
    except Exception:
        assets_page = paginator.page(1)

    # Usamos to_dict() para obtener los datos de cada asset en la página
    data = [asset.to_dict() for asset in assets_page]

    response_data = {
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': filtered_records,
        'data': data,
    }

    return JsonResponse(response_data)

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
            return JsonResponse({"message": "Categoría eliminada correctamente."})
        except Asset.DoesNotExist:
            return JsonResponse({"error": "Categoría no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido