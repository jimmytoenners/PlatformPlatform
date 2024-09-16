using PlatformPlatform.AccountManagement.Database;
using PlatformPlatform.AccountManagement.Tenants.Domain;
using PlatformPlatform.AccountManagement.Users.Domain;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Tests;

public sealed class DatabaseSeeder
{
    public readonly Tenant Tenant1;
    public readonly User User1;

    public DatabaseSeeder(AccountManagementDbContext accountManagementDbContext)
    {
        Tenant1 = Tenant.Create(new TenantId("tenant1"), "owner@tenant-1.com");
        accountManagementDbContext.Tenants.AddRange(Tenant1);
        User1 = User.Create(Tenant1.Id, "owner@tenant-1.com", UserRole.Owner, true, null);
        accountManagementDbContext.Users.AddRange(User1);

        accountManagementDbContext.SaveChanges();
    }
}
