using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;
using HotelStay.Application.Services;
using Moq;
using HotelStay.Domain.Enums;
using Xunit;

public class HotelSearchOrchestratorTests
{
    private readonly Mock<IHotelProvider> _mockProvider1;
    private readonly Mock<IHotelProvider> _mockProvider2;
    private readonly HotelSearchOrchestrator _orchestrator;

    public HotelSearchOrchestratorTests()
    {
        _mockProvider1 = new Mock<IHotelProvider>();
        _mockProvider2 = new Mock<IHotelProvider>();

        _mockProvider1.Setup(p => p.ProviderName).Returns("Provider1");
        _mockProvider2.Setup(p => p.ProviderName).Returns("Provider2");

        _orchestrator = new HotelSearchOrchestrator(new[] { _mockProvider1.Object, _mockProvider2.Object });
    }

    [Fact]
    public async Task SearchAsync_ShouldAggregateAndNormalizeResults()
    {
        // Arrange
        var request = new HotelSearchRequestDto
        {
            Destination = "Paris",
            CheckIn = DateTime.Today.AddDays(1),
            CheckOut = DateTime.Today.AddDays(3),
            RoomType = null
        };

        var provider1Results = new List<HotelSearchResponseDto>
        {
            new HotelSearchResponseDto
            {
                RoomType = RoomType.Standard,
                PricePerNight = 100,
                CancellationPolicy = CancellationPolicy.FreeCancellation,
                IsAvailable = true
            }
        };

        var provider2Results = new List<HotelSearchResponseDto>
        {
            new HotelSearchResponseDto
            {
                RoomType = RoomType.Deluxe,
                PricePerNight = 150,
                CancellationPolicy = CancellationPolicy.NonRefundable,
                IsAvailable = true
            }
        };

        _mockProvider1.Setup(p => p.SearchAsync(request, default)).ReturnsAsync(provider1Results);
        _mockProvider2.Setup(p => p.SearchAsync(request, default)).ReturnsAsync(provider2Results);

        // Act
        var results = await _orchestrator.SearchAsync(request);

        // Assert
        Assert.NotNull(results);
        Assert.Equal(2, results.Count);
        Assert.Contains(results, r => r.RoomType == RoomType.Standard && r.PricePerNight == 100);
        Assert.Contains(results, r => r.RoomType == RoomType.Deluxe && r.PricePerNight == 150);
    }
}