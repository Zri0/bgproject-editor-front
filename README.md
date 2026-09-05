# Card Editor - Frontend (Angular)

Web application for creating and editing game cards with dynamic buffs and effects.

## Stack

- **Framework**: Angular 17 (LTS)
- **Language**: TypeScript 5.2
- **Styling**: CSS3
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS Observables

## Requirements

- Node.js 18+
- npm 9+

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/card-editor-frontend.git
cd card-editor-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

The API URLs are configured in `/src/environments/`:

**For development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**For production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.cards.example.com/api'
};
```

### 4. Start the development server

```bash
npm start
# or
ng serve --open
```

The application will be available at `http://localhost:4200`

## Usage

The application is a simple card editor with two modes:

### Create a new card
- Go to `http://localhost:4200` (no parameters in the URL)
- Fill in the form
- Click "Save Card"
- Once saved, you can add Buffs and Effects

### Edit an existing card
- Go to `http://localhost:4200?id={cardId}`
- Modify the fields as needed
- Add or remove Buffs and Effects
- Click "Save Card" to save the changes

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── editor/          # Main component
│   │   ├── form/            # Editing form
│   │   └── preview/         # Card preview
│   ├── services/
│   │   ├── card.service.ts        # Card management
│   │   ├── config.service.ts      # Editor configuration
│   │   └── api-mappers.ts         # Backend <-> domain model mapping
│   ├── models/
│   │   └── models.ts        # TypeScript interfaces
│   └── app.component.ts
├── environments/
│   ├── environment.ts       # Dev
│   └── environment.prod.ts  # Prod
├── main.ts
├── index.html
└── styles.css
```

## Components

### EditorComponent
Main component that orchestrates everything:
- Determines the mode (create/edit) from the URL
- Loads the configuration
- Manages the card's lifecycle
- Props:
  - `mode`: 'create' | 'edit'
  - `card`: Card data
  - `config`: Loaded configuration

### FormComponent
Form for editing the card's data:
- Fields: title, description, image, level, races, attack, health
- Manages Buffs and Effects
- Events:
  - `@Output cardChanged`: When a field changes
  - `@Output save`: When the card is saved

### PreviewComponent
HTML/CSS preview of the card:
- Renders the card visually
- Syncs in real time with the form
- Shows applied buffs and effects

## Services

### CardService
Handles HTTP communication with the backend:
- `listCards()` - GET /cartas/
- `getCard(id)` - GET /cartas/{id}/
- `createCard(card)` - POST /cartas/
- `updateCard(id, card)` - PUT /cartas/{id}/
- `deleteCard(id)` - DELETE /cartas/{id}/
- `addBuff(cardId, buffId, parameters)` - POST /cartas/{id}/add-buff/
- `removeBuff(cardId, buffId)` - DELETE /cartas/{id}/remove-buff/{buffId}/
- `addEffect(cardId, effectId, parameters)` - POST /cartas/{id}/add-efecto/
- `removeEffect(cardId, effectId)` - DELETE /cartas/{id}/remove-efecto/{effectId}/

> The backend API is not part of this repository and speaks Spanish field
> names (`titulo`, `descripcion`, `parametros`, etc.) and Spanish endpoint
> segments (`add-efecto`, `remove-efecto`). `api-mappers.ts` translates
> between that wire format and the English domain models used everywhere
> else in the app, so the backend can stay untouched.

### ConfigService
Loads the editor configuration:
- `getConfig()` - Combination of buffs, effects and configuration
- `getBuffs()` - GET /buffs/
- `getEffects()` - GET /efectos/
- `getAvailableLevels()` - List of levels
- `getAvailableRaces()` - List of races

## Data Models

See `/src/app/models/models.ts` for the TypeScript interfaces:

- `Buff`: improvement applicable to a card
- `Effect`: effect contained in a card
- `Card`: main entity
- `CardAppliedBuff`: buff relationship with parameters
- `CardContainedEffect`: effect relationship with parameters
- `EditorConfig`: editor configuration

## Backend Connection

The application automatically connects to the backend at the URL configured in `environment.ts`.

**Make sure that:**

1. The backend is running at the correct URL (default `http://localhost:8000/api`)
2. CORS is enabled on the backend for the frontend's URL (default `http://localhost:4200`)
3. The backend's `.env` configuration includes:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
   ```

## Production Build

```bash
npm run build:prod
```

The compiled files will be in `/dist/card-editor-frontend`

## Testing

```bash
npm run test
```

## Development

### Changing the API URL
Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`

### Adding new fields to the card
1. Update the model in `src/app/models/models.ts`
2. Update the API mapping in `src/app/services/api-mappers.ts`
3. Add the field to the form (`form.component.html`)
4. Update the corresponding backend

### Customizing the preview design
Edit `src/app/components/preview/preview.component.css`

## Troubleshooting

### CORS errors
- Check that `CORS_ALLOWED_ORIGINS` on the backend includes `http://localhost:4200`
- Restart the Django server

### API not responding
- Check that the backend is running at `http://localhost:8000`
- Check the URL in `environment.ts`
- Check the browser logs (F12 > Console)

### Card doesn't save
- Check that title and image are provided (both required)
- Check the errors in the browser console
- Check that the backend has data in its database

## Performance

- Services use RxJS `shareReplay()` to cache configuration
- The form uses `OnPush` change detection (recommended)
- Images are loaded from external URLs (optimize your image servers)

## License

MIT
