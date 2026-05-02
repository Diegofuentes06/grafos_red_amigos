# Guías para Agentes/Codificadores - Red de Amigos Grafos

Este documento establece las reglas y estándares para futuros desarrolladores que trabajen en este proyecto. El objetivo es mantener la calidad, consistencia y mantenibilidad del código.

## Arquitectura del Proyecto

- **Frontend Puro**: El proyecto debe mantenerse como una aplicación web sin backend, usando solo HTML, CSS y JavaScript.
- **Módulos Separados**: Mantener la separación de responsabilidades en archivos JS dedicados (graph.js, recommendations.js, storage.js, app.js).
- **Dependencias Mínimas**: Solo usar librerías externas cuando sean estrictamente necesarias (ej: D3.js para visualización). Justificar cualquier nueva dependencia.
- **Estructura de Datos**: Usar lista de adyacencia para el grafo, mantener consistencia con el modelo G = (V, E).

## Estilo de Código

- **JavaScript Moderno**: Usar ES6+ features (arrow functions, template literals, destructuring, etc.).
- **Nombres Descriptivos**: Variables, funciones y clases deben tener nombres claros que indiquen su propósito.
- **Comentarios Educativos**: Especialmente en graph.js, incluir comentarios que expliquen conceptos de teoría de grafos.
- **Consistencia**: Seguir el estilo existente (espacios, indentación con 4 espacios, etc.).

## Pruebas Manuales

Antes de commits:
1. Abrir index.html y verificar que carga correctamente.
2. Probar agregar una nueva persona y verificar que aparece en el grafo.
3. Crear una amistad y confirmar que se dibuja la línea.
4. Seleccionar nodos y verificar detalles, amigos directos, amigos de amigos.
5. Probar recomendaciones y verificar que muestran puntaje y razones.
6. Limpiar datos y restaurar ejemplo, confirmar persistencia.
7. Verificar responsividad en diferentes tamaños de pantalla.

## Restricciones de Dependencias

- No usar frameworks pesados (React, Vue, Angular).
- No usar Node.js o APIs externas (salvo CDN para librerías justificadas).
- Mantener el proyecto ejecutable con doble clic en index.html.

## Criterios de Calidad

- **Funcionalidad**: Todas las features deben trabajar como especificado.
- **Performance**: El grafo debe manejar al menos 50 nodos sin lag significativo.
- **Accesibilidad**: Usar etiquetas semánticas, contrastes adecuados.
- **Mantenibilidad**: Código legible, bien comentado, modular.
- **Compatibilidad**: Funcionar en navegadores modernos (Chrome, Firefox, Safari, Edge).

## Proceso de Desarrollo

1. Revisar issues y especificaciones antes de codificar.
2. Implementar cambios incrementalmente, probando cada paso.
3. Actualizar documentación si es necesario.
4. Ejecutar pruebas manuales completas antes de commit.
5. Usar commits descriptivos en inglés.

## Conceptos Clave a Recordar

- Grafo no dirigido: A amigo de B implica B amigo de A.
- Lista de adyacencia: Eficiente para operaciones de grafo.
- BFS para exploración por niveles.
- DFS para componentes conexas.
- Heurística local: Combinar múltiples criterios para recomendaciones.