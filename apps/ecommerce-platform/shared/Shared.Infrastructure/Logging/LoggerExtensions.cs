using Microsoft.Extensions.Configuration;
using Serilog;

namespace Shared.Infrastructure.Logging;

public static class LoggerExtensions
{
    public static void ConfigureSharedLogger(this LoggerConfiguration loggerConfiguration, IConfiguration configuration, string applicationName)
    {
        loggerConfiguration
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", applicationName)
            .WriteTo.Console();

        var seqUrl = configuration["Seq:ServerUrl"];
        if (!string.IsNullOrEmpty(seqUrl))
        {
            loggerConfiguration.WriteTo.Seq(seqUrl);
        }
    }
}
