# MVA-FOOD 🍔🍟🥗

**MVA-FOOD** es una plataforma digital diseñada para restaurantes y food trucks que buscan modernizar su operación diaria mediante un sistema eficiente de gestión de menús, productos, colaboradores y promociones. Esta aplicación nace con el objetivo de simplificar la administración gastronómica y ofrecer una experiencia más fluida tanto para el personal del establecimiento como para sus clientes.

## 🚀 Características principales

- 📋 **Gestión de menús digitales**: Carga y edición de platos, bebidas y combos de manera rápida y visual.
- 🏷️ **Promociones y ofertas**: Crea promociones destacadas por tiempo limitado o según el tipo de producto.
- 👥 **Gestión de usuarios y roles**: Control de acceso para administradores y colaboradores del establecimiento.
- 🧾 **Visualización organizada**: Menú adaptado para mostrar en pantallas, tablets o incluso QR para clientes.
- 🧰 **Modular y escalable**: Arquitectura preparada para futuras funcionalidades como pedidos en línea, pagos digitales, reservas, etc.

## 🛠️ Tecnologías utilizadas

- **Backend**: .NET Core / C#
- **Frontend**: Astro + TailwindCSS
- **Base de datos**: SQL Server (opcionalmente escalable a PostgreSQL o MySQL)
- **Realtime (futuro)**: SignalR para notificaciones en tiempo real

## 🧩 Módulos pensados

- Gestión de menús y categorías
- Administración de productos e imágenes
- Gestión de colaboradores (empleados)
- Configuración de horarios y días festivos
- Visualización pública o privada del menú
- Sistema de sugerencias o favoritos
- Soporte multilenguaje (opcional)
- Panel de administración con estadísticas básicas

## 🌱 En desarrollo

Este proyecto está en una fase inicial. Actualmente está enfocado en la gestión interna del establecimiento, pero su arquitectura está preparada para evolucionar hacia una plataforma completa de pedidos en línea para clientes.

## 📦 Instalación local (por definir)

Próximamente se incluirán instrucciones paso a paso para clonar, configurar y correr el proyecto en entorno local.

## 🤝 Contribuciones

¡Se aceptan ideas, reportes de bugs y sugerencias para mejorar! Próximamente se habilitarán issues y pull requests con una guía de contribución.

## 📄 Licencia

Este proyecto se desarrollará inicialmente como software de código cerrado para uso específico, pero podrá liberarse bajo una licencia abierta en el futuro.

## 📁 Estructura del Proyecto

```
MVA-FOOD/
├── client/     # Frontend en Astro + Tailwind CSS
├── api/        # Backend en .NET Core Web API + JWT
├── docker-compose.yml
├── nginx.conf  # Opcional: para servir imágenes u app
├── README.md
├── .gitignore
├── .gitattributes
```

---

## 🚀 Cómo iniciar el proyecto

### 🧱 Requisitos
- Node.js + pnpm
- .NET 6+
- Docker + Docker Compose

### 🔧 Instalación

```bash
# Frontend
cd client
pnpm install
pnpm dev
```

```bash
# Backend
cd api
dotnet restore
dotnet run
```

O con Docker:
```bash
docker-compose up --build
```

---

## 📦 Servicios

| Servicio  | Ruta                 | Puerto |
|-----------|----------------------|--------|
| Frontend  | http://localhost:4321 | `4321` |
| Backend   | http://localhost:5000 | `5000` |
| NGINX     | http://localhost:8080 | `8080` |
| FTP       | ftp://localhost:21    | `21`   |

---

## ✨ Funcionalidades

- Registro e inicio de sesión con JWT
- CRUD de restaurantes y platos
- Carga de imágenes a través de FTP
- Panel administrador
- API segura y desacoplada
---

Desarrollado con ❤️ por el equipo MVA.

## Idea
https://www.maspedidos.menu/ejemplo/ejemplo
https://meniuapp.com/en-US/
