FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["apps/ecommerce-platform/", "."]

WORKDIR "/src/services/ShoppingCartService/ShoppingCartService.API"
RUN dotnet restore
RUN dotnet build "ShoppingCartService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ShoppingCartService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ShoppingCartService.API.dll"]
