# Monorepo con npm workspaces

Estructura de un monorepo con **npm workspaces** en **TypeScript**: web (Next.js), backend (Express) y app móvil (Expo). Los **tipos se comparten** desde el paquete `@npm-workspace/shared`.

---

## Estructura del repositorio

```
npm-workspace/
├── package.json          # Raíz: workspaces + postinstall (build shared)
├── package-lock.json
├── node_modules/
│
├── apps/
│   ├── web/              # Next.js (TS)
│   │   ├── package.json  # @npm-workspace/web → depende de shared
│   │   └── ...
│   ├── backend/          # Express (TS)
│   │   ├── package.json  # @npm-workspace/backend → depende de shared
│   │   ├── tsconfig.json
│   │   └── src/index.ts
│   └── mobile/           # Expo (TS)
│       └── package.json  # @npm-workspace/mobile → depende de shared
│
└── packages/
    └── shared/           # Tipos y utilidades compartidos (TypeScript)
        ├── package.json  # @npm-workspace/shared (main + types → dist/)
        ├── tsconfig.json
        ├── src/
        │   ├── index.ts  # reexporta tipos
        │   └── types.ts  # User, ApiResponse<T>, etc.
        └── dist/         # generado por tsc (JS + .d.ts)
```

---

## Cómo funciona npm workspaces

1. **Un solo `npm install` en la raíz**  
   Instala dependencias de todos los workspaces. npm crea un único `node_modules` en la raíz (con “hoisting”) y enlaces a los paquetes de `apps/*` y `packages/*`.

2. **Nombres con scope**  
   Cada app/paquete suele llamarse `@nombre-monorepo/nombre-paquete` (ej: `@npm-workspace/web`). Así se distinguen de paquetes públicos y se referencian entre sí.

3. **Referencias entre paquetes**  
   En el `package.json` de una app puedes poner:
   ```json
   "dependencies": {
     "@npm-workspace/shared": "*"
   }
   ```
   Tras `npm install`, ese paquete se enlaza desde `packages/shared` (no se publica a npm).

4. **Scripts desde la raíz**  
   - `npm run dev -w apps/web` → ejecuta `dev` solo en web.
   - `npm run build:shared` → compila `packages/shared` (genera `dist/` con JS y `.d.ts`). Se ejecuta tras `npm install` (postinstall).

---

## Tipos compartidos (TypeScript)

- **`packages/shared`** está en TypeScript: el código vive en `src/` y se compila a `dist/` con `npm run build`. El `package.json` de shared apunta `main` y `types` a `dist/`, así que las tres apps pueden importar tipos así:

  ```ts
  import type { User, ApiResponse } from '@npm-workspace/shared';
  ```

- **Definir nuevos tipos**: edita `packages/shared/src/types.ts` (o crea más archivos en `src/` y reexporta en `src/index.ts`). Luego ejecuta `npm run build:shared` en la raíz para regenerar `dist/`. Si tienes `postinstall`, ya se habrá compilado tras `npm install`.

- Las **apps** (web, backend, mobile) tienen `"@npm-workspace/shared": "*"` en dependencias y usan esos tipos en su código TS.

---

## Convenciones útiles

| Aspecto | Recomendación |
|--------|----------------|
| **apps/** | Solo aplicaciones que se “ejecutan” (web, API, móvil). |
| **packages/** | Librerías internas: shared, UI kit, configs, SDK de API, etc. |
| **Lockfile** | Un solo `package-lock.json` en la raíz. |
| **Versiones** | Puedes usar [npm-run-all](https://www.npmjs.com/package/npm-run-all) o [Turborepo](https://turbo.build/) para orquestar builds y tests. |
| **Configuración** | Compartir ESLint/TypeScript en `packages/eslint-config`, `packages/tsconfig`, etc. |

---

## Comandos desde la raíz

```bash
# Instalar dependencias (y compilar shared por postinstall)
npm install

# Compilar tipos compartidos tras cambiar packages/shared
npm run build:shared

# Ejecutar cada app
npm run web         # o: npm run dev -w apps/web
npm run backend    # o: npm run dev -w apps/backend
npm run mobile     # o: npm run start -w apps/mobile
```

---

## Resumen

- Todo el monorepo es **TypeScript**; los **tipos compartidos** viven en `packages/shared` y se consumen en las tres apps como `@npm-workspace/shared`.
- **Raíz**: `workspaces`, `postinstall` (build de shared) y scripts para cada app.
- **apps/**: web (Next.js), backend (Express en TS con `tsx`), mobile (Expo); cada uno depende de `@npm-workspace/shared`.
- **packages/shared**: `src/*.ts` → `tsc` → `dist/` (JS + `.d.ts`). Añade tipos en `src/types.ts` y reexporta en `src/index.ts`.
