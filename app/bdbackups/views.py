from django.shortcuts import render
import subprocess
import os
from datetime import datetime
from django.conf import settings
import glob
from cryptography.fernet import Fernet
import base64
import hashlib
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
import logging
from audit.models import AuditLog 
from django.contrib.auth import logout

def is_staff_user(user):
    return user.is_staff  # Solo permite acceso a staff
logger = logging.getLogger(__name__)

def get_encryption_key():
    if hasattr(settings, 'BACKUP_ENCRYPTION_KEY'):
        return settings.BACKUP_ENCRYPTION_KEY.encode('utf-8')
    secret = settings.SECRET_KEY.encode('utf-8')
    hash_key = hashlib.sha256(secret).digest()
    return base64.urlsafe_b64encode(hash_key)

def encrypt_file(input_path, output_path):
    fernet = Fernet(get_encryption_key())
    with open(input_path, 'rb') as f:
        data = f.read()
    encrypted_data = fernet.encrypt(data)
    with open(output_path, 'wb') as f:
        f.write(encrypted_data)

def decrypt_file(input_path, output_path):
    fernet = Fernet(get_encryption_key())
    with open(input_path, 'rb') as f:
        encrypted_data = f.read()
    try:
        decrypted_data = fernet.decrypt(encrypted_data)
        with open(output_path, 'wb') as f:
            f.write(decrypted_data)
        return True
    except Exception as e:
        logger.error(f"Decryption error: {str(e)}")
        return False

def get_backups_dir():
    backups_dir = os.path.join(settings.BASE_DIR, 'backups')
    if not os.path.exists(backups_dir):
        os.makedirs(backups_dir)
    return backups_dir

@login_required
@user_passes_test(is_staff_user, login_url='home:dashboard')
def backup_list(request):
    return render(request, 'backup.html', {
        'db_name': settings.DATABASES['default']['NAME'],
        'encryption_enabled': True,
    })

@login_required
@user_passes_test(is_staff_user, login_url='home:dashboard')
def list_backups(request):
    try:
        all_data = request.GET.get('all', False)
        backups_dir = get_backups_dir()
        backup_files = glob.glob(os.path.join(backups_dir, 'backup_*.*'))
        
        # Procesar todos los archivos de backup
        backups = []
        for file_path in backup_files:
            file_name = os.path.basename(file_path)
            file_ext = os.path.splitext(file_name)[1].lower()
            file_size = os.path.getsize(file_path)
            modified_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            
            backups.append({
                'name': file_name,
                'path': file_path,
                'size': file_size,  # Guardamos el tamaño en bytes para ordenamiento
                'size_display': f"{file_size/1024:.2f} KB",  # Versión formateada para mostrar
                'date': modified_time,  # Guardamos como datetime para ordenamiento
                'date_display': modified_time.strftime("%Y-%m-%d %H:%M:%S"),  # Versión formateada
                'encrypted': file_ext in ['.enc', '.crypt'],
                'encrypted_display': 'Sí' if file_ext in ['.enc', '.crypt'] else 'No'
            })
        
        # Configuración de ordenamiento
        order_column_index = request.GET.get('order[0][column]', '0')
        order_direction = request.GET.get('order[0][dir]', 'asc')
        
        # Mapeo de columnas
        column_map = {
            '0': 'name',
            '1': 'size',
            '2': 'date',
            '3': 'encrypted'
        }
        
        order_field = column_map.get(order_column_index, 'date')
        
        # Ordenar los backups
        reverse_sort = order_direction == 'desc'
        backups.sort(key=lambda x: x[order_field], reverse=reverse_sort)
        
        # Búsqueda
        search_value = request.GET.get('search[value]', '').strip().lower()
        if search_value:
            backups = [b for b in backups if (
                search_value in b['name'].lower() or
                search_value in b['date_display'].lower() or
                search_value in b['size_display'].lower() or
                search_value in b['encrypted_display'].lower()
            )]
        
        # Si se solicita todos los datos
        if all_data:
            return JsonResponse({
                'backups': [{
                    'name': b['name'],
                    'path': b['path'],
                    'size': b['size_display'],
                    'date': b['date_display'],
                    'encrypted': b['encrypted_display']
                } for b in backups],
                'db_name': settings.DATABASES['default']['NAME']
            })
        
        # Configuración de paginación
        try:
            draw = int(request.GET.get('draw', 0))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Parámetros inválidos'}, status=400)
        
        total_records = len(backups)
        filtered_records = total_records  # En este caso son iguales porque filtramos en memoria
        
        # Paginación
        paginated_backups = backups[start:start + length]
        
        return JsonResponse({
            'draw': draw,
            'recordsTotal': total_records,
            'recordsFiltered': filtered_records,
            'data': [{
                'name': backup['name'],
                'size': backup['size_display'],
                'date': backup['date_display'],
                'path': backup['path'],
                'encrypted': backup['encrypted_display'],
                'DT_RowId': f"backup_{backup['name']}"  # ID único para cada fila
            } for backup in paginated_backups]
        })
        
    except Exception as e:
        logger.error(f"Error al listar respaldos: {str(e)}", exc_info=True)
        return JsonResponse({
            'error': 'Error al listar respaldos',
            'details': str(e)
        }, status=500)

@login_required
def create_backup(request):
    if request.method == 'POST':
        try:
            db_settings = settings.DATABASES['default']
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_pass = db_settings['PASSWORD']
            db_host = db_settings.get('HOST', 'localhost')
            db_port = db_settings.get('PORT', '3306')
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"backup_{timestamp}.sql"
            encrypted_file = f"backup_{timestamp}.enc"
            
            backups_dir = get_backups_dir()
            temp_backup_path = os.path.join(backups_dir, backup_file)
            final_backup_path = os.path.join(backups_dir, encrypted_file)
            
            cmd = [
                'mysqldump',
                f'--host={db_host}',
                f'--port={db_port}',
                f'--user={db_user}',
                db_name
            ]
            
            env = os.environ.copy()
            if db_pass:
                env['MYSQL_PWD'] = db_pass
            
            # Crear backup temporal
            with open(temp_backup_path, 'w') as f:
                subprocess.run(cmd, stdout=f, env=env, check=True)
            
            # Encriptar
            encrypt_file(temp_backup_path, final_backup_path)
            os.remove(temp_backup_path)
            
            if not os.path.exists(final_backup_path):
                raise Exception("El archivo encriptado no se creó correctamente")
            
            return JsonResponse({
                'status': 'success',
                'message': f'Respaldo creado: {encrypted_file}',
                'filename': encrypted_file
            })
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Backup process error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'Error al ejecutar mysqldump'
            }, status=500)
            
        except Exception as e:
            logger.error(f"Backup error: {str(e)}")
            # Limpieza de archivos temporales
            if 'temp_backup_path' in locals() and os.path.exists(temp_backup_path):
                os.remove(temp_backup_path)
            if 'final_backup_path' in locals() and os.path.exists(final_backup_path):
                os.remove(final_backup_path)
                
            return JsonResponse({
                'status': 'error',
                'message': f'Error al crear respaldo: {str(e)}'
            }, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


@login_required
def restore_backup(request):
    if request.method != 'POST':
        return JsonResponse({
            'status': 'error',
            'message': 'Método no permitido'
        }, status=405)

    try:
        backup_path = request.POST.get('backup_path')
        if not backup_path or not os.path.exists(backup_path):
            return JsonResponse({
                'status': 'error',
                'message': 'Archivo de respaldo no encontrado'
            }, status=404)

        db_settings = settings.DATABASES['default']
        
        temp_restore_path = None
        try:
            is_encrypted = backup_path.endswith(('.enc', '.crypt'))
            if is_encrypted:
                temp_restore_path = os.path.join(get_backups_dir(), 'temp_restore.sql')
                if not decrypt_file(backup_path, temp_restore_path):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Error al desencriptar. Verifique la clave.'
                    }, status=400)
                restore_file = temp_restore_path
            else:
                restore_file = backup_path

            cmd = [
                'mysql',
                f'--host={db_settings.get("HOST", "localhost")}',
                f'--port={db_settings.get("PORT", "3306")}',
                f'--user={db_settings["USER"]}',
                db_settings['NAME']
            ]

            env = os.environ.copy()
            env['MYSQL_PWD'] = db_settings['PASSWORD']

            with open(restore_file, 'r') as f:
                subprocess.run(cmd, stdin=f, env=env, check=True)

            if temp_restore_path and os.path.exists(temp_restore_path):
                os.remove(temp_restore_path)

            logout(request)

            return JsonResponse({
                'status': 'success',
                'message': 'Base de datos restaurada exitosamente',
                'redirect_to_login': True
            })

        except subprocess.CalledProcessError as e:
            logger.error(f"Error en proceso de restauración: {str(e)}")
            raise Exception("Error al ejecutar el comando de restauración")

    except Exception as e:
        logger.error(f"Error general en restauración: {str(e)}")
        if 'temp_restore_path' in locals() and temp_restore_path and os.path.exists(temp_restore_path):
            os.remove(temp_restore_path)
        
        return JsonResponse({
            'status': 'error',
            'message': f'Error al restaurar: {str(e)}'
        }, status=500)

@login_required
def delete_backup(request):
    if request.method == 'POST':
        try:
            backup_path = request.POST.get('backup_path')
            if not backup_path:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Ruta de respaldo no proporcionada'
                }, status=400)
            
            backups_dir = get_backups_dir()
            if not os.path.abspath(backup_path).startswith(os.path.abspath(backups_dir)):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Ruta de archivo no permitida'
                }, status=403)
            
            if not os.path.exists(backup_path):
                return JsonResponse({
                    'status': 'error',
                    'message': 'El archivo de respaldo no existe'
                }, status=404)
            
            file_size = os.path.getsize(backup_path)
            file_name = os.path.basename(backup_path)
            
            try:
                # Registrar auditoría
                try:
                    audit_log = AuditLog(
                        user=request.user,
                        action='Delete',
                        model_name='FileBackup',
                        object_id=0,  # Valor por defecto
                        description=f"Respaldo eliminado: {file_name} (Tamaño: {file_size/1024:.2f} KB, Ruta: {backup_path})"
                    )
                    audit_log.save()
                except Exception as audit_error:
                    logger.error(f"Error en auditoría: {str(audit_error)}")
                
                # Eliminar archivo
                os.remove(backup_path)
                
                return JsonResponse({
                    'status': 'success',
                    'message': f'Respaldo eliminado: {file_name}',
                    'file_size': f"{file_size/1024:.2f} KB",
                    'audit_log_id': getattr(audit_log, 'id', None)
                })
                
            except Exception as e:
                logger.error(f"Error al eliminar: {str(e)}")
                return JsonResponse({
                    'status': 'error',
                    'message': f'Error al eliminar archivo: {str(e)}'
                }, status=500)
                
        except Exception as e:
            logger.error(f"Error general: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': f'Error al eliminar respaldo: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'status': 'error',
        'message': 'Método no permitido'
    }, status=405)