using PlatformPlatform.AccountManagement.Domain.Tenants;

namespace PlatformPlatform.AccountManagement.Application.Tenants.Dtos;

/// <summary>
///     A shared DTO for the Tenant entity used both in GetTenantByIdQuery and CreateTenant Command.
///     This class is returned by the WebAPI, making it a public contract, so it should be changed with care.
/// </summary>
public record TenantDto
{
    /// <summary>
    ///     The Id of the Tenant.
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    ///     The date and time when the Tenant was created in UTC format.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    ///     The date and time when the Tenant was last modified in UTC format.
    /// </summary>
    public required DateTime? ModifiedAt { get; init; }


    /// <summary>
    ///     The name of the Tenant.
    /// </summary>
    public required string Name { get; init; }

    public static TenantDto? CreateFrom(Tenant? tenant)
    {
        if (tenant is null) return null;
        return new TenantDto
        {
            Id = tenant.Id.AsRawString()!, CreatedAt = tenant.CreatedAt, ModifiedAt = tenant.ModifiedAt,
            Name = tenant.Name
        };
    }
}