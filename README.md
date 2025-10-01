# SISTEMA DE BIBLOTECAS - PRUEBA TECNICA

# DESCRIPCION
Solución técnica para el ejercicio de Analista de Desarrollo. Este proyecto implementa una API REST para la gestión de libros y préstamos, junto con un frontend para una interacción fluida e intuitiva.


# TECNOLOGIAS UTILIZADAS 

BACKEND -> LARAVEL
FRONTEND -> REACT-START KIT LARAVEL
BASE DE DATOS -> SQlite
GEMINI -> Errores, bugs
CURSOR -> Errores, Utilizacion para parte frond de la aplicacion

# REQUISITOS FUNCIONALAES
CRUD Completo de Libros

Registro de Préstamos: Permitir asociar un usuario con uno o más libros, registrando fecha_préstamo y fecha_devolución.

Gestión de Devoluciones: Actualizar el estado del préstamo y la disponibilidad (stock)

Generación de Estadísticas: Implementar un endpoint para mostrar métricas clave de la biblioteca.

# REQUISITOS NO FUNCIONALES

Usabilidad y Diseño: Interfaz en React sencilla pero funcional , garantizando una experiencia de usuario fluida e intuitiva , con diseño responsivo y accesible

Siguiendo principios de arquitectura limpia y buenas prácticas, utilizando controladores, servicios, y/o repositorios en el backend

Desde el frontend con manejo de errores

# CASOS DE PRUEBAS BASICOS Y ESTRUCTURACION DE PRUEBAS

Identificación de Escenarios de Uso (Casos de Uso):

 - Gestión de Libros:

Como bibliotecario, quiero agregar un nuevo libro con su título, autor, género y disponibilidad para ampliar el catálogo.

Como bibliotecario, quiero modificar la información de un libro existente para corregir errores.

Como bibliotecario, quiero ver una lista de todos los libros para conocer el inventario.

Como bibliotecario, quiero eliminar un libro que ya no formará parte de la colección.

- Gestión de Préstamos:

Como bibliotecario, quiero registrar un nuevo usuario para llevar un control de quién realiza los préstamos.


Como bibliotecario, quiero registrar el préstamo de un libro a un usuario, asignando una fecha de préstamo y devolución.

Como bibliotecario, quiero marcar un libro como devuelto, actualizando su estado de disponibilidad.


Identificación de Posibles Casos de Error:

Validación de Formularios: Intentar crear un libro sin título o autor.

Lógica de Negocio: Intentar prestar un libro que no está disponible (disponibilidad = 0).

Integridad de Datos: Intentar registrar un usuario con usuario que ya existe.


# Arquitectura de la API Endpoints Propuestos

libros -> metodo get y post -> endponit api/libros -> obtener listado de libros disponiblidad y cantidad total de lñoibros(STOCK)

usuarios -> metodo post y get -> endponit api/usuarios -> CRUD usuarios (opcional roles para cada usuario)

prestamos -> metodo post -> endpoint api/prestamos registar nuevos prestamos de libros

prestamos -> metodo put -> endponit api/prestamos/id/devolucion -> registar la devolucion del prestamo

estadistica -> metodo get -> api/estadistica/viewlibros

# POSIBLES METRICAS Y ESTADISTICAS 
Proporción de libros devueltos con retraso. Valor: Ayuda a definir políticas de préstamos y penalizaciones.

Ranking de libros con más registros en la tabla de Detalle Préstamo. Valor: Informa decisiones de compra de nuevos ejemplares

Gráfico de barras que muestre qué géneros son más populares. Valor: Entender el interés de los usuarios y balancear la colección.

Total de usuarios que han solicitado al menos un préstamo en un periodo. Valor: Medir el nivel de uso del sistema.

# MANUAL BASICO

USUARIO DE PRUEBA

EMAIL: admin@test.com
PASSWORD: password

Dashboard: Vizualizacion modulos principales mas estadisticas basicas

Libros: La vista principal permite visualizar el stock y utilizar un formulario para el CRUD completo.

Préstamos: Se registra un préstamo seleccionando un libro disponible y un usuario de la base de datos.

Devolución: La lista de préstamos activos permite marcar el ítem como devuelto, lo que actualiza el stock del libro.

