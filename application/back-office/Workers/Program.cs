using PlatformPlatform.BackOffice;
using PlatformPlatform.BackOffice.Database;
using PlatformPlatform.SharedKernel;
using PlatformPlatform.SharedKernel.Database;

// Worker service is using WebApplication.CreateBuilder instead of Host.CreateDefaultBuilder to allow scaling to zero
var builder = WebApplication.CreateBuilder(args);

// Configure storage infrastructure like Database, BlobStorage, Entity Framework DB Context, etc.
builder
    .AddDevelopmentPort(9299)
    .AddBackOfficeInfrastructure();

// Configure dependency injection services like Repositories, MediatR, Pipelines, FluentValidation validators, etc.
builder.Services.AddBackOfficeServices();

builder.Services.AddTransient<DatabaseMigrationService<BackOfficeDbContext>>();

var host = builder.Build();

// Apply migrations to the database (should be moved to GitHub Actions or similar in production)
using var scope = host.Services.CreateScope();
var migrationService = scope.ServiceProvider.GetRequiredService<DatabaseMigrationService<BackOfficeDbContext>>();
migrationService.ApplyMigrations();

await host.RunAsync();
