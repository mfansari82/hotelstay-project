using Microsoft.AspNetCore.Diagnostics;
using FluentValidation;
using System.Net;

namespace HotelStay.Api.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            // Log the exception
            _logger.LogError(exception, "An error occurred: {Message}", exception.Message);

            if (exception is ValidationException validationException)
            {
                httpContext.Response.StatusCode = (int)HttpStatusCode.UnprocessableEntity;

                await httpContext.Response.WriteAsJsonAsync(
                    new
                    {
                        StatusCode = httpContext.Response.StatusCode,
                        Errors = validationException.Errors.Select(e => e.ErrorMessage)
                    },
                    cancellationToken);

                return true;
            }

            // Map exception to status code and message
            var (statusCode, message) = MapExceptionToResponse(exception);

            httpContext.Response.StatusCode = (int)statusCode;

            await httpContext.Response.WriteAsJsonAsync(
                new
                {
                    StatusCode = statusCode,
                    Message = message
                },
                cancellationToken);

            return true;
        }

        private (HttpStatusCode StatusCode, string Message) MapExceptionToResponse(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException => (HttpStatusCode.BadRequest, "A required argument was null."),
                ArgumentException => (HttpStatusCode.BadRequest, "Invalid argument provided."),
                KeyNotFoundException => (HttpStatusCode.NotFound, "The requested resource was not found."),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Access is denied."),
                _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
            };
        }
    }
}
