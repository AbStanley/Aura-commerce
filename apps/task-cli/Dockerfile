# Build Stage
FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0 AS build
# Note: Using 8.0 as proxy for 10.0 in this environment, or use specific 10.0 tag if available.
# In 2026, this would likely be: FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["apps/task-cli/TaskTracker.csproj", "apps/task-cli/"]
RUN dotnet restore "apps/task-cli/TaskTracker.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/apps/task-cli"
RUN dotnet build "TaskTracker.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "TaskTracker.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/nightly/runtime:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskTracker.dll"]
