# ---------------------------------------
# Imagen base para compilación (SDK Preview .NET 9)
# ---------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build


WORKDIR /src

# Copiar solo los archivos de proyecto (para cache de dependencias)
COPY MVA-FOOD.API/MVA-FOOD.API.csproj MVA-FOOD.API/
COPY MVA-FOOD.Core/MVA-FOOD.Core.csproj MVA-FOOD.Core/
COPY MVA-FOOD.Infrastructure/MVA-FOOD.Infrastructure.csproj MVA-FOOD.Infrastructure/

# Restaurar dependencias
RUN dotnet restore MVA-FOOD.API/MVA-FOOD.API.csproj

# Copiar todo el código fuente
COPY . .

# Compilar en modo Release
WORKDIR /src/MVA-FOOD.API
RUN dotnet build -c Release -o /app/build

# ---------------------------------------
# Publicar
# ---------------------------------------
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# ---------------------------------------
# Imagen final para runtime
# ---------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copiar la app publicada desde la etapa 'publish'
COPY --from=publish /app/publish .

# Punto de entrada
ENTRYPOINT ["dotnet", "MVA-FOOD.API.dll"]
