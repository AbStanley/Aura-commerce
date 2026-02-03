FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["apps/ecommerce-platform/ECommercePlatform.sln", "./"]
# Restore all to leverage cache roughly
COPY ["apps/ecommerce-platform/services/OrderService/OrderService.API/OrderService.API.csproj", "services/OrderService/OrderService.API/"]
COPY ["apps/ecommerce-platform/shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "shared/Shared.Infrastructure/"]

# Copy everything else project file wise (optimistic approach for simplicity in this turn)
COPY ["apps/ecommerce-platform/", "."]

WORKDIR "/src/services/OrderService/OrderService.API"
RUN dotnet restore
RUN dotnet build "OrderService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OrderService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OrderService.API.dll"]
