using FluentValidation;
using FluentValidation.AspNetCore;
using HotelStay.Api.Middleware;
using HotelStay.Application.Behaviors;
using HotelStay.Application.DTOs;
using HotelStay.Application.Features.Hotels.BookHotel;
using HotelStay.Application.Features.Hotels.GetBooking;
using HotelStay.Application.Features.Hotels.SearchHotels;
using HotelStay.Application.Interfaces;
using HotelStay.Application.Services;
using HotelStay.Infrastructure.Persistence;
using HotelStay.Infrastructure.Providers;
using HotelStay.Infrastructure.Seed;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Polly;
using Polly.Extensions.Http;
using Serilog;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// =======================================================
// SERILOG CONFIGURATION
// =======================================================

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File(
        "logs/hotelstay-.txt",
        rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// =======================================================
// DATABASE CONFIGURATION
// =======================================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

// =======================================================
// MEDIATR CONFIGURATION
// =======================================================

builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(Assembly.Load("HotelStay.Application"));
});

// =======================================================
// FLUENT VALIDATION
// =======================================================

builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddValidatorsFromAssembly(Assembly.Load("HotelStay.Application"));


// =======================================================
// PIPELINE BEHAVIOR
// =======================================================

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));


// =======================================================
// GLOBAL EXCEPTION HANDLER
// =======================================================

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddProblemDetails();


// =======================================================
// SWAGGER
// =======================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// =======================================================
// HOTEL PROVIDERS (STRATEGY PATTERN)
// =======================================================

builder.Services.AddScoped<IHotelProvider, PremierStaysProvider>();
builder.Services.AddScoped<IHotelProvider, BudgetNestsProvider>();

// =======================================================
// ORCHESTRATOR
// =======================================================

builder.Services.AddScoped<IHotelSearchOrchestrator, HotelSearchOrchestrator>();
builder.Services.AddScoped<IHotelBookingOrchestrator, HotelBookingOrchestrator>();
builder.Services.AddScoped<IHotelBookingStatusOrchestrator, HotelBookingStatusOrchestrator>();

// =======================================================
// HTTP CLIENTS + SIMPLE POLLY
// =======================================================

builder.Services.AddHttpClient("HotelProviders")
    .AddPolicyHandler(GetRetryPolicy());


// =======================================================
// CORS
// =======================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowAnyOrigin();
        });
});

var app = builder.Build();

app.UseSerilogRequestLogging();

app.UseExceptionHandler();

// =======================================================
// SEED DATA
// =======================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    var configuration = services.GetRequiredService<IConfiguration>();

    var seeder = new DatabaseSeeder(context, configuration);
    await seeder.SeedAsync();
}

app.UseCors("AllowAngular");

// =======================================================
// SWAGGER PIPELINE
// =======================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}


// =======================================================
// MINIMAL API ENDPOINTS
// =======================================================

app.MapGet("/",
    () => Results.Ok("HotelStay API Running"));


// =======================================================
// HOTEL ENDPOINTS
// =======================================================

/// <summary>
/// Searches for hotels based on destination, check-in/check-out dates, and room type.
/// </summary>
/// <remarks>
/// Queries both PremierStays and BudgetNests providers, filters unavailable results, normalizes the data, and returns a unified list.
/// </remarks>
/// <param name="query">Search parameters including destination, check-in/check-out dates, and optional room type.</param>
/// <param name="sender">MediatR sender for handling the query.</param>
/// <returns>A list of available hotels with normalized data.</returns>
app.MapGet("/hotels/search",
    async (
        [AsParameters] SearchHotelsQuery query,
        ISender sender) =>
    {
        var result = await sender.Send(query);

        return Results.Ok(result);
    })
.WithName("SearchHotels");

/// <summary>
/// Books a hotel room with the selected provider.
/// </summary>
/// <remarks>
/// Validates the booking request, including document requirements, and confirms the booking with the selected provider.
/// </remarks>
/// <param name="command">Booking details including passenger name, document type, and document number.</param>
/// <param name="sender">MediatR sender for handling the command.</param>
/// <returns>A booking confirmation with a reference number.</returns>
app.MapPost("/hotels/book",
    async (
        BookHotelCommand command,
        ISender sender) =>
    {
        var result = await sender.Send(command);

        return Results.Ok(result);
    })
.WithName("BookHotel");

/// <summary>
/// Retrieves the booking status for a given reference number.
/// </summary>
/// <remarks>
/// Returns the booking status, including provider name, total price, and cancellation policy.
/// </remarks>
/// <param name="reference">The booking reference number.</param>
/// <param name="provider">The hotel provider name.</param>
/// <param name="sender">MediatR sender for handling the query.</param>
/// <returns>The booking status for the given reference number.</returns>
app.MapGet("/hotels/booking/{reference}/{provider}",
    async (
        string reference,
        string provider,
        ISender sender) =>
    {
        var query = new GetBookingQuery(reference, provider);

        var result = await sender.Send(query);

        return Results.Ok(result);
    })
.WithName("GetBooking");


// =======================================================
// APP RUN
// =======================================================

app.Run();


// =======================================================
// POLLY RETRY POLICY
// =======================================================

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            2,
            retryAttempt =>
                TimeSpan.FromMilliseconds(200));
}
