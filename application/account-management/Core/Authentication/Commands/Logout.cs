using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using PlatformPlatform.AccountManagement.Core.Authentication.Services;
using PlatformPlatform.AccountManagement.Core.TelemetryEvents;
using PlatformPlatform.AccountManagement.Core.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.TelemetryEvents;

namespace PlatformPlatform.AccountManagement.Core.Authentication.Commands;

public sealed record LogoutCommand : ICommand, IRequest<Result>;

public sealed class LogoutHandler(
    AuthenticationTokenService authenticationTokenService,
    IHttpContextAccessor httpContextAccessor,
    ITelemetryEventsCollector events,
    ILogger<LogoutHandler> logger
) : IRequestHandler<LogoutCommand, Result>
{
    public Task<Result> Handle(LogoutCommand command, CancellationToken cancellationToken)
    {
        var httpContext = httpContextAccessor.HttpContext ?? throw new InvalidOperationException("HttpContext is null.");

        var userIdentifier = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);

        authenticationTokenService.Logout();

        if (userIdentifier is null || !UserId.TryParse(userIdentifier.Value, out var userId))
        {
            logger.LogWarning("No user identifier found in claims.");
        }
        else
        {
            events.CollectEvent(new Logout(userId!));
        }

        return Task.FromResult(Result.Success());
    }
}