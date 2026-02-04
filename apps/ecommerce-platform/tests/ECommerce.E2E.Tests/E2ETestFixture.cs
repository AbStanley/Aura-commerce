using System.Diagnostics;

namespace ECommerce.E2E.Tests;

public class E2ETestFixture : IAsyncLifetime
{
    private readonly HttpClient _httpClient;
    private string _composeFilePath = string.Empty;

    public E2ETestFixture()
    {
        _httpClient = new HttpClient();
    }

    public HttpClient Client
    {
        get
        {
            return _httpClient;
        }
    }

    public async Task InitializeAsync()
    {
        // Find docker-compose.yml
        var projectDir = Directory.GetParent(Directory.GetCurrentDirectory())?.Parent?.Parent?.Parent?.FullName;
        if (projectDir == null) throw new DirectoryNotFoundException("Could not find project root.");

        var baseDir = AppContext.BaseDirectory;
        var composeFile = Path.GetFullPath(Path.Combine(baseDir, "../../../../../../docker-compose.yml"));

        if (!File.Exists(composeFile))
        {
            // Fallback for different runner depths
            composeFile = Path.GetFullPath(Path.Combine(baseDir, "../../../../../docker-compose.yml"));
        }

        if (!File.Exists(composeFile))
        {
            throw new FileNotFoundException($"Could not locate docker-compose.yml at {composeFile}");
        }

        _composeFilePath = composeFile;

        Console.WriteLine($"Found docker-compose.yml at: {_composeFilePath}");

        // Note: 'down' first to ensure clean slate
        await RunCommandAsync("docker", $"compose -f \"{_composeFilePath}\" down -v");
        await RunCommandAsync("docker", $"compose -f \"{_composeFilePath}\" up -d --build");

        _httpClient.BaseAddress = new Uri("http://localhost:5000");
        await WaitForGatewayAsync();
    }

    private async Task WaitForGatewayAsync()
    {
        var retries = 30; // 60 seconds
        while (retries > 0)
        {
            try
            {
                var response = await _httpClient.GetAsync("/health");

                if (response.StatusCode != System.Net.HttpStatusCode.ServiceUnavailable &&
                    response.StatusCode != System.Net.HttpStatusCode.BadGateway)
                {
                    return;
                }
            }
            catch
            {
            }

            await Task.Delay(2000);
            retries--;
        }

        throw new TimeoutException("Gateway did not become healthy in time.");
    }

    public async Task DisposeAsync()
    {
        if (!string.IsNullOrEmpty(_composeFilePath))
        {
            // Tear down
            await RunCommandAsync("docker", $"compose -f \"{_composeFilePath}\" down -v");
        }
        _httpClient.Dispose();
    }

    private async Task RunCommandAsync(string command, string args)
    {
        Console.WriteLine($"Exec: {command} {args}");
        var processInfo = new ProcessStartInfo(command, args)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = processInfo };
        var outputBuilder = new System.Text.StringBuilder();
        var errorBuilder = new System.Text.StringBuilder();

        process.OutputDataReceived += (sender, e) =>
        {
            if (e.Data != null)
            {
                outputBuilder.AppendLine(e.Data);
                Console.WriteLine($"[Docker] {e.Data}");
            }
        };
        process.ErrorDataReceived += (sender, e) =>
        {
            if (e.Data != null)
            {
                errorBuilder.AppendLine(e.Data);
                Console.WriteLine($"[Docker Error] {e.Data}");
            }
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            throw new Exception($"Command '{command} {args}' failed with exit code {process.ExitCode}. Error: {errorBuilder}. Output: {outputBuilder}");
        }
    }
}
