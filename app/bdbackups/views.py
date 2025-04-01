from django.shortcuts import render, redirect
from django.contrib import messages
import subprocess
import os
from datetime import datetime
from django.conf import settings
import glob
from cryptography.fernet import Fernet
import base64
import hashlib

## --- CÓDIGO DE ENCRIPTACIÓN MEJORADO --- ##

def get_encryption_key():
    """
    Obtiene la clave de encriptación en este orden:
    1. Usa settings.BACKUP_ENCRYPTION_KEY si está definida
    2. Deriva una clave segura desde settings.SECRET_KEY
    """
    # Primero intenta con una clave dedicada para backups
    if hasattr(settings, 'BACKUP_ENCRYPTION_KEY'):
        return settings.BACKUP_ENCRYPTION_KEY.encode('utf-8')
    
    # Fallback: Deriva una clave desde SECRET_KEY
    secret = settings.SECRET_KEY.encode('utf-8')
    # Usamos SHA-256 para obtener los 32 bytes necesarios
    hash_key = hashlib.sha256(secret).digest()
    # Codificamos en base64 url-safe (requerido por Fernet)
    return base64.urlsafe_b64encode(hash_key)

def encrypt_file(input_path, output_path):
    """Encripta un archivo usando la clave configurada"""
    fernet = Fernet(get_encryption_key())
    with open(input_path, 'rb') as f:
        data = f.read()
    encrypted_data = fernet.encrypt(data)
    with open(output_path, 'wb') as f:
        f.write(encrypted_data)

def decrypt_file(input_path, output_path):
    """Desencripta un archivo usando la clave configurada"""
    fernet = Fernet(get_encryption_key())
    with open(input_path, 'rb') as f:
        encrypted_data = f.read()
    try:
        decrypted_data = fernet.decrypt(encrypted_data)
        with open(output_path, 'wb') as f:
            f.write(decrypted_data)
        return True
    except Exception as e:
        print(f"Error al desencriptar: {str(e)}")
        return False

## --- FUNCIONES PRINCIPALES MODIFICADAS --- ##

def get_backups_dir():
    backups_dir = os.path.join(settings.BASE_DIR, 'backups')
    if not os.path.exists(backups_dir):
        os.makedirs(backups_dir)
    return backups_dir

def backup_list(request):
    backups_dir = get_backups_dir()
    backup_files = glob.glob(os.path.join(backups_dir, 'backup_*.*'))
    backups = []
    
    for file_path in backup_files:
        file_name = os.path.basename(file_path)
        file_ext = os.path.splitext(file_name)[1]
        file_size = os.path.getsize(file_path)
        modified_time = datetime.fromtimestamp(os.path.getmtime(file_path))
        
        backups.append({
            'name': file_name,
            'path': file_path,
            'size': f"{file_size/1024:.2f} KB",
            'date': modified_time.strftime("%Y-%m-%d %H:%M:%S"),
            'encrypted': file_ext in ['.enc', '.crypt']  # Detecta archivos encriptados
        })
    
    backups.sort(key=lambda x: x['date'], reverse=True)
    
    return render(request, 'backup.html', {
        'backups': backups,
        'db_name': settings.DATABASES['default']['NAME'],
        'encryption_enabled': True
    })

def create_backup(request):
    if request.method == 'POST':
        try:
            db_settings = settings.DATABASES['default']
            
            # Configuración de MySQL
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_pass = db_settings['PASSWORD']
            db_host = db_settings.get('HOST', 'localhost')
            db_port = db_settings.get('PORT', '3306')
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"backup_{timestamp}.sql"
            encrypted_file = f"backup_{timestamp}.enc"  # Extensión para encriptados
            
            backups_dir = get_backups_dir()
            temp_backup_path = os.path.join(backups_dir, backup_file)
            final_backup_path = os.path.join(backups_dir, encrypted_file)
            
            # Comando para mysqldump
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
            
            # 1. Crear backup temporal sin encriptar
            with open(temp_backup_path, 'w') as f:
                subprocess.run(cmd, stdout=f, env=env, check=True)
            
            # 2. Encriptar el backup
            encrypt_file(temp_backup_path, final_backup_path)
            
            # 3. Eliminar el archivo temporal
            os.remove(temp_backup_path)
            
            messages.success(request, f'Respaldo encriptado creado: {encrypted_file}')
        except subprocess.CalledProcessError as e:
            messages.error(request, f'Error en el comando mysqldump: {str(e)}')
            if os.path.exists(temp_backup_path):
                os.remove(temp_backup_path)
        except Exception as e:
            messages.error(request, f'Error al crear respaldo: {str(e)}')
            # Limpieza de archivos temporales en caso de error
            if 'temp_backup_path' in locals() and os.path.exists(temp_backup_path):
                os.remove(temp_backup_path)
            if 'final_backup_path' in locals() and os.path.exists(final_backup_path):
                os.remove(final_backup_path)
        
    return redirect('backup_list')

def restore_backup(request):
    if request.method == 'POST':
        backup_path = request.POST.get('backup_path')
        
        if not backup_path or not os.path.exists(backup_path):
            messages.error(request, 'Archivo de respaldo no encontrado')
            return redirect('backup_list')
        
        try:
            db_settings = settings.DATABASES['default']
            
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_pass = db_settings['PASSWORD']
            db_host = db_settings.get('HOST', 'localhost')
            db_port = db_settings.get('PORT', '3306')
            
            backups_dir = get_backups_dir()
            temp_restore_path = os.path.join(backups_dir, 'temp_restore.sql')
            
            # Verificar si el archivo está encriptado
            is_encrypted = backup_path.endswith('.enc') or backup_path.endswith('.crypt')
            
            if is_encrypted:
                # Desencriptar primero
                if not decrypt_file(backup_path, temp_restore_path):
                    messages.error(request, 'Error al desencriptar. ¿Clave incorrecta?')
                    return redirect('backup_list')
                restore_file = temp_restore_path
            else:
                restore_file = backup_path
            
            # Comando para restaurar
            cmd = [
                'mysql',
                f'--host={db_host}',
                f'--port={db_port}',
                f'--user={db_user}',
                db_name
            ]
            
            env = os.environ.copy()
            env['MYSQL_PWD'] = db_pass
            
            with open(restore_file, 'r') as f:
                result = subprocess.run(cmd, stdin=f, env=env, check=True)
            
            # Limpiar archivo temporal si se usó
            if is_encrypted and os.path.exists(temp_restore_path):
                os.remove(temp_restore_path)
            
            messages.success(request, f'Base de datos restaurada desde: {os.path.basename(backup_path)}')
        except subprocess.CalledProcessError as e:
            messages.error(request, f'Error al ejecutar mysql: {str(e)}')
        except Exception as e:
            messages.error(request, f'Error al restaurar: {str(e)}')
            if 'temp_restore_path' in locals() and os.path.exists(temp_restore_path):
                os.remove(temp_restore_path)
    
    return redirect('backup_list')

def delete_backup(request):
    if request.method == 'POST':
        backup_path = request.POST.get('backup_path')
        
        if not backup_path or not os.path.exists(backup_path):
            messages.error(request, 'El archivo de respaldo no existe')
            return redirect('backup_list')
        
        try:
            os.remove(backup_path)
            messages.success(request, f'Respaldo eliminado: {os.path.basename(backup_path)}')
        except Exception as e:
            messages.error(request, f'Error al eliminar: {str(e)}')
    
    return redirect('backup_list')