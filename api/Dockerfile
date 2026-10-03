FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /src

COPY api/MVA-FOOD.API/MVA-FOOD.API.csproj MVA-FOOD.API/
COPY api/MVA-FOOD.Core/MVA-FOOD.Core.csproj MVA-FOOD.Core/
COPY api/MVA-FOOD.Infrastructure/MVA-FOOD.Infrastructure.csproj MVA-FOOD.Infrastructure/

RUN dotnet restore MVA-FOOD.API/MVA-FOOD.API.csproj

COPY api/ .

WORKDIR /src/MVA-FOOD.API

RUN dotnet publish -c Release -o /publish /p:UseAppHost=false