﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PlatformPlatform.AccountManagement.Infrastructure;

#nullable disable

namespace PlatformPlatform.AccountManagement.Infrastructure.Migrations
{
    [DbContext(typeof(AccountManagementDbContext))]
    [Migration("20240307000000_Initial")]
    partial class Initial
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("PlatformPlatform.AccountManagement.Domain.AccountRegistrations.AccountRegistration", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("varchar(26)");

                    b.Property<bool>("Completed")
                        .IsRequired()
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("varchar(100)");

                    b.Property<DateTimeOffset?>("ModifiedAt")
                        .IsConcurrencyToken()
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("OneTimePasswordHash")
                        .IsRequired()
                        .HasColumnType("varchar(84)");

                    b.Property<int>("RetryCount")
                        .HasColumnType("int");

                    b.Property<string>("TenantId")
                        .IsRequired()
                        .HasColumnType("varchar(30)");

                    b.Property<DateTimeOffset>("ValidUntil")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.ToTable("AccountRegistrations");
                });

            modelBuilder.Entity("PlatformPlatform.AccountManagement.Domain.Tenants.Tenant", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("varchar(30)");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("ModifiedAt")
                        .IsConcurrencyToken()
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(30)");

                    b.Property<string>("State")
                        .IsRequired()
                        .HasColumnType("varchar(20)");

                    b.HasKey("Id");

                    b.ToTable("Tenants");
                });

            modelBuilder.Entity("PlatformPlatform.AccountManagement.Domain.Users.User", b =>
                {
                    b.Property<string>("TenantId")
                        .IsRequired()
                        .HasColumnType("varchar(30)");

                    b.Property<long>("Id")
                        .HasColumnType("char(26)");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("ModifiedAt")
                        .IsConcurrencyToken()
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(30)");

                    b.Property<string>("LastName")
                        .HasColumnType("nvarchar(30)");

                    b.Property<string>("UserRole")
                        .IsRequired()
                        .HasColumnType("varchar(20)");

                    b.Property<bool>("EmailConfirmed")
                        .IsRequired()
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("TenantId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("PlatformPlatform.AccountManagement.Domain.Users.User", b =>
                {
                    b.HasOne("PlatformPlatform.AccountManagement.Domain.Tenants.Tenant", null)
                        .WithMany()
                        .HasForeignKey("TenantId")
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}