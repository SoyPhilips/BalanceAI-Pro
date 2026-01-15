# BalanceAI

BalanceAI es una aplicación web moderna diseñada para el seguimiento nutricional inteligente. Permite a los usuarios gestionar sus objetivos calóricos, registrar alimentos de forma manual y analizar comidas mediante inteligencia artificial.

## Características Principales

- Registro de alimentos con base de datos integrada.
- Análisis de comidas mediante fotos utilizando Inteligencia Artificial con registro automático en el historial.
- Seguimiento en tiempo real de objetivos calóricos diarios y macronutrientes.
- Panel de control (Dashboard) con resumen de progreso y registro del día.
- Sugerencias periódicas para mantener un estilo de vida saludable.
- Sistema de perfil personalizable con objetivos dinámicos.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Una cuenta en Supabase
- Una API Key de Google Generative AI (para el análisis de fotos)

## Instalación y Configuración

1.  Clona el repositorio en tu máquina local.
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Crea un archivo llamado `.env` en la raíz del proyecto basándote en la siguiente estructura:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    VITE_GOOGLE_API_KEY=tu_google_api_key
    ```
    Nota: La funcionalidad de análisis por foto requiere que añadas tu clave de Google AI en la variable `VITE_GOOGLE_API_KEY`.

## Ejecución del Proyecto

Para iniciar el servidor de desarrollo localmente, ejecuta:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Configuración de la Base de Datos (Supabase)

Para que la aplicación funcione correctamente en un nuevo proyecto de Supabase, sigue estos pasos:

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2. Ve a la sección **SQL Editor** en el panel de Supabase.
3. Ejecuta los archivos de la carpeta `supabase/` en el siguiente orden:
   - `01_tables.sql`: Crea la estructura de tablas.
   - `02_policies.sql`: Configura la seguridad y el registro automático de perfiles.
   - `03_seed_data.sql`: Carga alimentos y recetas iniciales.
   - `05_delete_user_rpc.sql`: Habilita la función de eliminación de cuenta.
   - `06_enable_realtime.sql`: Activa la sincronización en tiempo real.
4. Asegúrate de activar **Email Auth** en la configuración de autenticación si deseas usar registro por correo.

## Seguridad

Este repositorio incluye un archivo `.gitignore` configurado para omitir el archivo `.env`. Nunca compartas tus claves privadas ni las subas a repositorios públicos.

---

Desarrollado con React, Vite y Supabase.
