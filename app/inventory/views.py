from django.http import HttpResponse
from django.db import connection

def check_db_connection(request):
    try:
        # Intenta ejecutar una consulta simple
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return HttpResponse("La conexión a la base de datos es exitosa.")
    except Exception as e:
        return HttpResponse(f"Error al conectar a la base de datos: {str(e)}")