using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Core.Tenants.Domain;
using PlatformPlatform.AccountManagement.Core.Users.Domain;
using PlatformPlatform.SharedKernel.Entities;
using PlatformPlatform.SharedKernel.IdGenerators;

namespace PlatformPlatform.AccountManagement.Core.Authentication.Domain;

public sealed class Login : AggregateRoot<LoginId>
{
    public const int MaxAttempts = 3;
    public const int ValidForSeconds = 300;

    private Login(TenantId tenantId, UserId userId, string oneTimePasswordHash)
        : base(LoginId.NewId())
    {
        TenantId = tenantId;
        UserId = userId;
        OneTimePasswordHash = oneTimePasswordHash;
        ValidUntil = CreatedAt.AddSeconds(ValidForSeconds);
    }

    public TenantId TenantId { get; }

    public UserId UserId { get; private set; }

    public string OneTimePasswordHash { get; private set; }

    [UsedImplicitly]
    public DateTimeOffset ValidUntil { get; private set; }

    public int RetryCount { get; private set; }

    public bool Completed { get; private set; }

    public bool HasExpired()
    {
        return ValidUntil < TimeProvider.System.GetUtcNow();
    }

    public static Login Create(User user, string oneTimePasswordHash)
    {
        return new Login(user.TenantId, user.Id, oneTimePasswordHash);
    }

    public void RegisterInvalidPasswordAttempt()
    {
        RetryCount++;
    }

    public void MarkAsCompleted()
    {
        if (HasExpired() || RetryCount >= MaxAttempts)
        {
            throw new UnreachableException("This account login process id has expired.");
        }

        if (Completed) throw new UnreachableException("The login process id has already been created.");

        Completed = true;
    }
}

[TypeConverter(typeof(StronglyTypedIdTypeConverter<string, LoginId>))]
[IdPrefix("login")]
public sealed record LoginId(string Value) : StronglyTypedUlid<LoginId>(Value)
{
    public override string ToString()
    {
        return Value;
    }
}
