# Card Editor - Frontend (Angular)

Aplicación web para crear y editar cartas de juego con buffs y efectos dinámicos.

## Stack

- **Framework**: Angular 17 (LTS)
- **Language**: TypeScript 5.2
- **Styling**: CSS3
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS Observables

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/yourusername/card-editor-frontend.git
cd card-editor-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Las URLs de la API se configuran en `/src/environments/`:

**Para desarrollo** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**Para producción** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.cartas.example.com/api'
};
```

### 4. Iniciar servidor de desarrollo

```bash
npm start
# o
ng serve --open
```

La aplicación estará disponible en `http://localhost:4200`

## Uso

La aplicación es un editor de cartas simple con dos modos:

### Crear una nueva carta
- Accede a `http://localhost:4200` (sin parámetros en la URL)
- Completa el formulario
- Haz clic en "Guardar Carta"
- Una vez guardada, podrás agregar Buffs y Efectos

### Editar una carta existente
- Accede a `http://localhost:4200?id={cartaId}`
- Modifica los campos según sea necesario
- Agrega o remueve Buffs y Efectos
- Haz clic en "Guardar Carta" para guardar los cambios

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── editor/          # Componente principal
│   │   ├── form/            # Formulario de edición
│   │   └── preview/         # Vista previa de la carta
│   ├── services/
│   │   ├── carta.service.ts       # Gestión de cartas
│   │   └── config.service.ts      # Configuración del editor
│   ├── models/
│   │   └── models.ts        # Interfaces de TypeScript
│   └── app.component.ts
├── environments/
│   ├── environment.ts       # Dev
│   └── environment.prod.ts  # Prod
├── main.ts
├── index.html
└── styles.css
```

## Componentes

### EditorComponent
Componente principal que orquesta todo:
- Determina el modo (create/edit) desde la URL
- Carga la configuración
- Maneja el ciclo de vida de la carta
- Props:
  - `mode`: 'create' | 'edit'
  - `carta`: Datos de la carta
  - `config`: Configuración cargada

### FormComponent
Formulario para editar los datos de la carta:
- Campos: título, descripción, imagen, nivel, razas, ataque, vida
- Gestión de Buffs y Efectos
- Eventos:
  - `@Output cartaChanged`: Cuando cambia un campo
  - `@Output guardar`: Cuando se guarda la carta

### PreviewComponent
Vista previa HTML/CSS de la carta:
- Renderiza visualmente la carta
- Se sincroniza en tiempo real con el formulario
- Muestra buffs y efectos aplicados

## Servicios

### CartaService
Maneja la comunicación HTTP con el backend:
- `listarCartas()` - GET /cartas/
- `obtenerCarta(id)` - GET /cartas/{id}/
- `crearCarta(carta)` - POST /cartas/
- `actualizarCarta(id, carta)` - PUT /cartas/{id}/
- `eliminarCarta(id)` - DELETE /cartas/{id}/
- `agregarBuff(cartaId, buffId, parametros)` - POST /cartas/{id}/add-buff/
- `removerBuff(cartaId, buffId)` - DELETE /cartas/{id}/remove-buff/{buffId}/
- `agregarEfecto(cartaId, efectoId, parametros)` - POST /cartas/{id}/add-efecto/
- `removerEfecto(cartaId, efectoId)` - DELETE /cartas/{id}/remove-efecto/{efectoId}/

### ConfigService
Carga la configuración del editor:
- `obtenerConfig()` - Combinación de buffs, efectos y configuración
- `obtenerBuffs()` - GET /buffs/
- `obtenerEfectos()` - GET /efectos/
- `obtenerNivelesDisponibles()` - Lista de niveles
- `obtenerRazasDisponibles()` - Lista de razas

## Modelos de Datos

Consulta `/src/app/models/models.ts` para las interfaces TypeScript:

- `Buff`: Mejora aplicable a una carta
- `Efecto`: Efecto contenido en una carta
- `Carta`: Entidad principal
- `CartaBuffAplicado`: Relación de buff con parámetros
- `CartaEfectoContenido`: Relación de efecto con parámetros
- `EditorConfig`: Configuración del editor

## Conexión con Backend

La aplicación se conecta automáticamente al backend en la URL configurada en `environment.ts`.

**Asegúrate de:**

1. Que el backend está ejecutándose en la URL correcta (por defecto `http://localhost:8000/api`)
2. Que CORS está habilitado en el backend con la URL del frontend (por defecto `http://localhost:4200`)
3. Que las configuraciones en `.env` del backend incluyan:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
   ```

## Build para Producción

```bash
npm run build:prod
```

Los archivos compilados estarán en `/dist/card-editor-frontend`

## Testing

```bash
npm run test
```

## Desarrollo

### Cambiar la URL del API
Edita `src/environments/environment.ts` y `src/environments/environment.prod.ts`

### Agregar nuevos campos a la carta
1. Actualiza el modelo en `src/app/models/models.ts`
2. Agrega el campo en el formulario (`form.component.html`)
3. Actualiza el backend correspondiente

### Personalizar el diseño del preview
Edita `src/app/components/preview/preview.component.css`

## Troubleshooting

### CORS errors
- Verifica que `CORS_ALLOWED_ORIGINS` en el backend incluya `http://localhost:4200`
- Reinicia el servidor Django

### API no responde
- Verifica que el backend está ejecutándose en `http://localhost:8000`
- Comprueba la URL en `environment.ts`
- Verifica los logs del navegador (F12 > Console)

### Carta no se guarda
- Comprueba que el título e imagen son obligatorios
- Revisa los errores en la consola del navegador
- Verifica que el backend tiene datos en la BD

## Performance

- Los servicios usan RxJS `shareReplay()` para cachear configuración
- El formulario usa `OnPush` change detection (recomendado)
- Las imágenes se cargan desde URLs externas (optimiza tus servidores de imágenes)

## Licencia

MIT
