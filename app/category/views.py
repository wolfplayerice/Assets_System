from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from .models import Category
# Create your views here.


def category(request):
    return render(request, 'crudcat.html')

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


def delete_category(request, category_id):
    print(f"Received request method: {request.method}")  # Para depuración
    if request.method == "DELETE":
        try:
            category = Category.objects.get(pk=category_id)
            category.delete()
            return JsonResponse({"message": "Categoría eliminada correctamente."})
        except Category.DoesNotExist:
            return JsonResponse({"error": "Categoría no encontrada."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return HttpResponse(status=405)  # Método no permitido