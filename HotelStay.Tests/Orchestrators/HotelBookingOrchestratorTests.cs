using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;
using HotelStay.Application.Services;
using Moq;
using HotelStay.Domain.Enums;

public class HotelBookingOrchestratorTests
{
    [Fact]
    public async Task BookAsync_CallsCorrectProvider_ReturnsBookingResponse()
    {
        var providerMock = new Mock<IHotelProvider>();
        providerMock.SetupGet(p => p.ProviderName).Returns("PremierStays");
        providerMock.Setup(p => p.BookAsync(It.IsAny<BookingRequestDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new BookingResponseDto { ReferenceNumber = "ABC123", Status = "Confirmed" });

        var orchestrator = new HotelBookingOrchestrator(new[] { providerMock.Object });

        var request = new BookingRequestDto { Provider = "PremierStays" };
        var result = await orchestrator.BookAsync(request);

        Assert.Equal("ABC123", result.ReferenceNumber);
        Assert.Equal("PremierStays", result.Provider);
    }

    [Fact]
    public async Task GetBookingAsync_CallsCorrectProvider_ReturnsBookingStatus()
    {
        var providerMock = new Mock<IHotelProvider>();
        providerMock.SetupGet(p => p.ProviderName).Returns("BudgetNests");
        providerMock.Setup(p => p.GetBookingAsync("REF456", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new BookingStatusDto { ReferenceNumber = "REF456", Status = BookingStatus.Confirmed });

        var orchestrator = new HotelBookingStatusOrchestrator(new[] { providerMock.Object });

        var result = await orchestrator.GetBookingStatusAsync("REF456", "BudgetNests");

        Assert.Equal("REF456", result.ReferenceNumber);
        Assert.Equal(BookingStatus.Confirmed, result.Status);
    }
}