# Cómo contribuir

Este repositorio es una lista curada, no código. Contribuir es sencillo:

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/add-provider-x`
3. Agrega o corrige la sección siguiendo el formato existente (ver plantilla abajo)
4. Envía un Pull Request con una descripción clara

## Qué incluir al agregar un proveedor

- Nombre y link oficial
- Límites exactos (requests, tokens, etc.), con fecha de verificación
- Modelos disponibles
- ¿Requiere verificación por teléfono o tarjeta?
- ¿Usa los datos para entrenamiento?

## Plantilla

```markdown
### [Nombre del Provider](https://url.com)

**Límites:**
- X requests/minuto
- Y requests/día

**Requiere:** [Teléfono/Tarjeta/Ninguno]

**Modelos:** Lista de modelos disponibles
```

## Reglas

- Solo servicios gratuitos legítimos. No listamos ingeniería inversa de chatbots existentes ni nada que viole los términos de servicio del proveedor original.
- Si citas límites, verifícalos contra la documentación oficial del proveedor, no contra otra lista de terceros.
- Si el recurso pertenece a otra persona (por ejemplo, un proyecto open source de terceros), créditalo con su nombre/usuario y enlaza a su repositorio original.
