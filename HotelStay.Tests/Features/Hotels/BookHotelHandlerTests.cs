using HotelStay.Application.DTOs;
using HotelStay.Application.Features.Hotels.BookHotel;
using HotelStay.Application.Interfaces;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace HotelStay.Tests.Features.Hotels
{
    public class BookHotelHandlerTests
    {
        [Fact]
        public async Task Handle_ValidRequest_ReturnsBookingResponse()
        {
            // Arrange
            var orchestratorMock = new Mock<IHotelBookingOrchestrator>();
            orchestratorMock.Setup(o => o.BookAsync(It.IsAny<BookingRequestDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new BookingResponseDto { ReferenceNumber = "ABC123", Status = "Confirmed", Provider = "PremierStays" });

            var handler = new BookHotelHandler(orchestratorMock.Object);

            var command = new BookHotelCommand
            {
                Provider = "PremierStays",
                HotelName = "Luxusry",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                NumberOfGuests = 2,
                PassengerName = "John Doe",
                DocumentNumber = "A1234567",
                DocumentType = HotelStay.Domain.Enums.DocumentType.Passport,
                Destination = "London"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal("ABC123", result.ReferenceNumber);
            Assert.Equal("Confirmed", result.Status);
            Assert.Equal("PremierStays", result.Provider);
        }

        [Fact]
        public async Task Handle_ProviderNotFound_ThrowsInvalidOperationException()
        {
            // Arrange
            var orchestratorMock = new Mock<IHotelBookingOrchestrator>();
            orchestratorMock.Setup(o => o.BookAsync(It.IsAny<BookingRequestDto>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Provider not found"));

            var handler = new BookHotelHandler(orchestratorMock.Object);

            var command = new BookHotelCommand
            {
                Provider = "UnknownProvider",
                HotelName = "Unknown",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                NumberOfGuests = 2,
                PassengerName = "John Doe",
                DocumentNumber = "A1234567",
                DocumentType = HotelStay.Domain.Enums.DocumentType.Passport,
                Destination = "UnknownCity"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_InvalidBookingRequest_ThrowsArgumentException()
        {
            // Arrange
            var orchestratorMock = new Mock<IHotelBookingOrchestrator>();
            orchestratorMock.Setup(o => o.BookAsync(It.IsAny<BookingRequestDto>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ArgumentException("Invalid booking request"));

            var handler = new BookHotelHandler(orchestratorMock.Object);

            var command = new BookHotelCommand
            {
                Provider = "PremierStays",
                HotelName = "Invalid", // Invalid HotelId
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                NumberOfGuests = 2,
                PassengerName = "John Doe",
                DocumentNumber = "A1234567",
                DocumentType = HotelStay.Domain.Enums.DocumentType.Passport,
                Destination = "London"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
        }
    }
}