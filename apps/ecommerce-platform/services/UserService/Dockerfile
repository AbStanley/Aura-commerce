FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy Solution and Projects (optimizing cache by copying minimal files first)
COPY ["apps/ecommerce-platform/ECommercePlatform.sln", "./"]
COPY ["apps/ecommerce-platform/services/UserService/UserService.API/UserService.API.csproj", "services/UserService/UserService.API/"]
COPY ["apps/ecommerce-platform/services/UserService/UserService.Application/UserService.Application.csproj", "services/UserService/UserService.Application/"]
COPY ["apps/ecommerce-platform/services/UserService/UserService.Infrastructure/UserService.Infrastructure.csproj", "services/UserService/UserService.Infrastructure/"]
COPY ["apps/ecommerce-platform/services/UserService/UserService.Domain/UserService.Domain.csproj", "services/UserService/UserService.Domain/"]
# Shared
COPY ["apps/ecommerce-platform/shared/Shared.Common/Shared.Common.csproj", "shared/Shared.Common/"]
COPY ["apps/ecommerce-platform/shared/Shared.Contracts/Shared.Contracts.csproj", "shared/Shared.Contracts/"]
COPY ["apps/ecommerce-platform/shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "shared/Shared.Infrastructure/"]

# Restore specific service
RUN dotnet restore "services/UserService/UserService.API/UserService.API.csproj"

# Copy Full Source
COPY ["apps/ecommerce-platform/", "."]

# Build
WORKDIR "/src/services/UserService/UserService.API"
RUN dotnet build "UserService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "UserService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UserService.API.dll"]
