from django.shortcuts import render
from django.http.response import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from .models import Category
from .forms import Create_category
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from audit.models import AuditLog 
# Create your views here.

@login_required
def category(request):
    category_create_form = Create_category()
    return render(request, 'crudcat.html',{
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'cat_form': category_create_form,
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
                AuditLog.objects.create(
                    user=request.user,
                    action='create',
                    model_name='Category',
                    object_id=category.id,
                    description=f"Categoría creada: {category.name}"
                )
                messages.success(request, 'La categoría se ha guardado correctamente.')
                return HttpResponseRedirect(reverse('home:category'))
            except Exception as e:
                messages.error(request, f'Error inesperado: {str(e)}')
                return HttpResponseRedirect(reverse('home:category'))
    return render(request, 'crudcat.html', {'cat_form': Create_category()})

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
        category = get_object_or_404(Category, pk=category_id)
        category.delete()
        AuditLog.objects.create(
            user=request.user,
            action='delete',
            model_name='Category',
            object_id=category_id,
            description=f"Categoría eliminada: {category.name}"
        )
        return JsonResponse({"message": "Categoría eliminada correctamente."})
    return HttpResponse(status=405)

@login_required
def audit_log_view(request):
    logs = AuditLog.objects.filter(model_name='Category').order_by('-timestamp')
    return render(request, 'audit/audit_log.html', {'logs': logs})