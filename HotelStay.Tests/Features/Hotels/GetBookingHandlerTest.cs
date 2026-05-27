using HotelStay.Application.DTOs;
using HotelStay.Application.Features.Hotels.GetBooking;
using HotelStay.Application.Interfaces;
using Moq;
using HotelStay.Domain.Enums;

namespace HotelStay.Tests.Features.Hotels
{
    public class GetBookingHandlerTest
    {
        [Fact]
        public async Task Handle_ValidRequest_ReturnsBookingStatus()
        {
            var orchestratorMock = new Mock<IHotelBookingStatusOrchestrator>();
            orchestratorMock.Setup(o => o.GetBookingStatusAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new BookingStatusDto { ReferenceNumber = "REF123", Status = BookingStatus.Confirmed });

            var handler = new GetBookingHandler(orchestratorMock.Object);
            var query = new GetBookingQuery("REF123", "PremierStays");

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Equal("REF123", result.ReferenceNumber);
            Assert.Equal(BookingStatus.Confirmed, result.Status);
            Assert.Equal("PremierStays", result.Provider);
        }

        [Fact]
        public async Task Handle_OrchestratorThrows_ThrowsException()
        {
            var orchestratorMock = new Mock<IHotelBookingStatusOrchestrator>();
            orchestratorMock.Setup(o => o.GetBookingStatusAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Booking not found"));

            var handler = new GetBookingHandler(orchestratorMock.Object);
            var query = new GetBookingQuery("REF123", "PremierStays");

            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(query, CancellationToken.None));
        }
    }
}
