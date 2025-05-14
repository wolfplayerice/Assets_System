# InvenTrack

InvenTrack (Inventory Tracking) es una aplicación web desarrollada en 2025 por Daniela Rangel, Victor Parra, Victor Soto y Kevin Gil, como proyecto de practicas profesionales para optar al titulo universitario de Ingeniería de Sistemas de la Universidad Politécnica de la Fuerza Armada Nacional Bolivariana (UNEFA). 

Esta aplicación web nace de la necesidad del departamento de Gerencia de Tecnología de la Asociación Civil Bibliotecas Virtuales de Aragua (A.C.BBVVA) de contar con un sistema que permita consultar y gestionar de manera eficiente su inventario de bienes muebles, permitiendo aprovechar tanto los elementos existentes como el espacio disponible en el depósito.

Este archivo proporciona un resumen de las herramientas, dependencias y referencias empleadas durante el desarrollo del proyecto.  

---

## Herramientas utilizadas

### Backend
- **Python** v3.11.2: Lenguaje utilizado para manejar las solicitudes al servidor y generar las respuestas esperadas por el usuario.
- **MySQL**: Motor de base de datos del tipo relacional, para permitir almacenar grandes cantidades de información dentro de la aplicación.

### Frontend
- **HTML5**: Para modular adecuadamente el contenido de la aplicación, proveyendo una estructura tipo web.
- **CSS3**: Para manejar la estética del sistema utilizando estilos personalizados.
- **JavaScript**: Para procesar solicitudes y añadir interactividad que permita mejorar la experiencia del usuario.

### Frameworks y Librerías
- **Django** v5.1.7: Framework de Python para facilitar el desarrollo de aplicaciones web.
- **Bootstrap** v5.3.5: Framework de CSS utilizado para manejar los diseños responsivos y la estética de la aplicación en general.
- **PDFMake** v0.2.7: Librería para generación del contenido de la aplicación en formato PDF.
- **jQuery** v3.5.0: Librería de JavaScript para el manejo de tablas dinámicas (DataTables).
- **DataTables** v2.2.2: Para manejar tablas dinámicas y la visualización más ordenada de su contenido.
- **Font Awesome** v6.7.2 Web Free: Librería de íconos para manejar una estética más agradable visualmente.
- **Select2** v4.0.13: plugin jQuery para manejar la búsqueda dinámica de datos en los campos de selección (etiquetas "<select>" de HTML).

---

## Notas importantes sobre las dependencias

- Las siguientes herramientas están alojadas **localmente** en las carpetas del proyecto:
  - Django.
  - Bootstrap.
  - PDFMake.
  - jQuery.
  - DataTables.
  - Font Awesome.
  - Select2.

Esta información sirve como referencia en caso de necesitar restaurar las dependencias o solucionar problemas en el futuro.  

---

## Requisitos del sistema

### Hardware y Software
Esta aplicación web puede ser ejecutada en dispositivos que cuenten con los siguientes requerimientos, o superiores

- **Hardware**:
  - Procesador: Intel® Celeron® N2840  × 2
  - Memoria RAM: 4GB DDR3.
  - Almacenamiento SSD: 16GB.
  - Pantalla: LED 14'' (1366x768).
  - Gráficos: Mesa Intel® HD Graphics (BYT)

- **Software**:
  - Sistema Operativo: Debian GNU/Linux 12 (bookworm) (64 Bits).
  - XAMPP for Linux v8.0.30-0:
    - MariaDB/10.11.11.
    - Apache/2.4.58 (Unix).
    - OpenSSL/1.1.1.
    - PHP/8.0.30.

### Compatibilidad
La aplicación web puede ser compatible con equipos que cuenten con los siguientes requisitos mínimos.
- **Servidor Web**: Apache.
- **PHP**: Versión 8.0.30 o superior.
- **Base de Datos**: MySQL.  

---

## Instrucciones generales

1. Colocar en la carpeta raíz del servidor web los archivos que componen el proyecto.
2. Importar el archivo SQL incluido para la creación de la base de datos y el usuario principal, así como su perfil.
3. Asegurar que el archivo de configuración del proyecto tenga las credenciales correctas para la conexion e inicializacion de la base de datos.
Asegurarse de configurar correctamente las credenciales de conexión a la base de datos en el archivo de configuración (`app/settings.py`).
4. Verificar que todas las depencias locales estén en la ruta correspondiente (`static/assets`).
5. Para poder iniciar sesión en la aplicación una vez instalada, utilice las siguientes credenciales:
 - Usuario: almacentecnologia
 - Contraseña: gtecnologia2025.
Este usuario tendrá, además, una pregunta de seguridad configurada; una vez inicie sesión por primera vez, debe configurar una nueva pregunta y una nueva respuesta.

Para cualquier configuración o consulta adicional, por favor consultar la documentación elaborada para tal fin (Manual de Instalación).

---

## Contacto

Cualquier consulta que resulte durante el proceso de instalación de esta aplicación web puede ser dirigida a:

Daniela Rangel - [danielaalexandrarangel@gmail.com].
Victor Parra - [deerpg17x@gmail.com].
Victor Soto - [razercool12@gmail.com].
Kevin Gil - [kgandres13@gmail.com].

---

### Licencia

[Indica la licencia del proyecto, si aplica].