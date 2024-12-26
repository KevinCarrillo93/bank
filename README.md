# Proyecto: Configuración y Puesta en Marcha

Este documento detalla los pasos necesarios para levantar el proyecto tanto en el backend (API) como en el frontend.

## Requisitos Previos

1. **Node.js**
   - Asegúrate de tener Node.js instalado en tu sistema. Puedes descargarlo desde [aqui](https://nodejs.org/).
2. **PNPM**
   - Instala PNPM de manera global:
     ```bash
     npm install -g pnpm
     ```
3. **Vite**
   - El frontend utiliza Vite, que no requiere configuración adicional para este proyecto.
4. **Git**
   - Necesario para clonar el repositorio.

---

## Clonar el Proyecto

Primero, clona este repositorio en tu sistema local:
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

---

## Configuración y Ejecución del Backend (API)

1. **Ir al Directorio del Backend**
   ```bash
   cd api
   ```

2. **Instalar Dependencias**
   ```bash
   pnpm install
   ```

3. **Ejecutar el Servidor**
   ```bash
   pnpm run dev
   ```
   - Esto iniciará el servidor backend y estará disponible en `http://localhost:3000` (o el puerto configurado en el archivo `.env`).

---

## Configuración y Ejecución del Frontend

1. **Ir al Directorio del Frontend**
   ```bash
   cd client
   ```

2. **Instalar Dependencias**
   ```bash
   npm  install
   ```


3. **Ejecutar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```
   - Esto iniciará el frontend y estará disponible en `http://localhost:5173` (o el puerto configurado por Vite).
