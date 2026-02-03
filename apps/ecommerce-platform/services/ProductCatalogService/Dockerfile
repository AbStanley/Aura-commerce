FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["apps/ecommerce-platform/ECommercePlatform.sln", "./"]
COPY ["apps/ecommerce-platform/services/ProductCatalogService/ProductCatalogService.API/ProductCatalogService.API.csproj", "services/ProductCatalogService/ProductCatalogService.API/"]
# Shared
COPY ["apps/ecommerce-platform/shared/Shared.Common/Shared.Common.csproj", "shared/Shared.Common/"]
COPY ["apps/ecommerce-platform/shared/Shared.Contracts/Shared.Contracts.csproj", "shared/Shared.Contracts/"]
COPY ["apps/ecommerce-platform/shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "shared/Shared.Infrastructure/"]

# Simplification: Restore solution to get all deps (easiest for now given complexity)
RUN dotnet restore

# Copy Full Source
COPY ["apps/ecommerce-platform/", "."]

WORKDIR "/src/services/ProductCatalogService/ProductCatalogService.API"
RUN dotnet build "ProductCatalogService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProductCatalogService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ProductCatalogService.API.dll"]
