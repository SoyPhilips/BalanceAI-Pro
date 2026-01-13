# Guía de Instalación y Ejecución - BalanceAI

Para ejecutar este proyecto en otro computador, sigue estos pasos detallados.

## 1. Requisitos Previos (Lo que necesitas instalar)

Antes de nada, asegúrate de tener instalado lo siguiente en el nuevo computador:

*   **Node.js**: Es el entorno necesario para ejecutar JavaScript fuera del navegador.
    *   Descárgalo e instálalo desde: [nodejs.org](https://nodejs.org/) (La versión LTS es la recomendada).
*   **Git** (Opcional pero recomendado): Para clonar el repositorio si lo subes a GitHub.
    *   Descárgalo desde: [git-scm.com](https://git-scm.com/).

## 2. Copiar el Proyecto

Tienes dos opciones:
*   **Opción A (Git):** Si subiste el código a GitHub, clónalo:
    ```bash
    git clone <TU_URL_DEL_REPOSITORIO>
    cd BalanceAI
    ```
*   **Opción B (Manual):** Copia toda la carpeta del proyecto (excepto la carpeta `node_modules`, esa pesa mucho y se reinstala sola) al nuevo computador.

## 3. Instalar Dependencias

Abre una terminal (PowerShell, CMD o la terminal de VS Code) dentro de la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto descargará todas las librerías necesarias (React, Vite, Supabase, etc.) y creará la carpeta `node_modules` automáticamente.

## 4. Configurar Variables de Entorno (.env)

⚠️ **IMPORTANTE:** El archivo `.env` no se suele copiar ni subir a GitHub por seguridad. Debes crearlo manualmente en el nuevo computador.

1.  Crea un archivo llamado `.env` en la raíz del proyecto (al lado de `package.json`).
2.  Copia y pega las siguientes claves (rellénalas con tus valores reales que tienes en el PC actual):

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_GOOGLE_API_KEY=tu_api_key_de_google
VITE_NANO_BANANA_API_KEY=tu_api_key_de_nano_banana_o_google
```

*Si no tienes estas claves a mano, búscalas en tu archivo `.env` actual o en el panel de Supabase/Google Cloud.*

## 5. Ejecutar el Proyecto

Una vez instalado todo y configurado el `.env`, ejecuta:

```bash
npm run dev
```

Verás algo como:
```
  VITE vX.X.X  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abre ese enlace (`http://localhost:5173`) en tu navegador y ¡listo!

## Resumen de Comandos

```bash
# 1. Instalar (solo la primera vez)
npm install

# 2. Ejecutar (cada vez que quieras usarlo)
npm run dev
```
