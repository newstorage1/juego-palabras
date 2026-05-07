# Agentes - Contexto del Proyecto

## 📁 Ubicación de la Documentación

Toda la documentación, especificaciones y contexto del proyecto se encuentra en la carpeta `.kiro/`.

### Archivos de Referencia

- **.kiro/README.md**: Documentación general del proyecto, características, estructura e instalación
- **.kiro/Game_Updated.md**: Especificaciones actualizadas del juego, incluyendo flujos de usuario y modes de juego
- **.kiro/descripcion_de_como_jugar.md**: Guía de cómo jugar
- **.kiro/configurar-boton-confirmacion.md**: Documentación del sistema de confirmación de palabras
- **.kiro/bug-chat-no-responde.md**: Corrección del sistema de chat
- **.kiro/bug-puntuacion-no-suma(resuelto).md**: Resolución del bug de puntuación
- **.kiro/Inestabilidad al iniciar (Corregido).md**: Corrección de problemas de inicio

## 📝 Directrices para el Desarrollo

Antes de realizar cualquier modificación o crear nueva funcionalidad:

1. **Revisar .kiro/Game_Updated.md** para entender los requisitos actualizados del proyecto
2. **Consultar .kiro/README.md** para la estructura técnica y arquitectura del proyecto
3. **Mantener consistencia** con el código existente en las carpetas `client/` y `server/`
4. **Actualizar documentación** en `.kiro/` si se implementan nuevas funcionalidades significativas
5. **No realizar cambios grandes** sin antes avisar al usuario y confirmar el alcance
6. **No modificar nombres de funciones o variables existentes** - mantener los nombres implementados tal como están
7. **No utilizar comandos de git (commit, push, etc.)** sin antes avisar y confirmar al usuario

## 🔧 Áreas de Trabajo Actuales

- Implementación del Pre-lobby (pantalla de entrada con nickname y edad)
- Lobby Multijugador (sala de espera con chat)
- Modificación del Lobby Individual (sin opción de crear nickname)
- Sistema de record de jugadas ganadas (pendiente de detalles)