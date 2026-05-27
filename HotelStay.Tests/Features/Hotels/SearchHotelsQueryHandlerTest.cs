using HotelStay.Application.DTOs;
using HotelStay.Application.Features.Hotels.SearchHotels;
using HotelStay.Application.Interfaces;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Tests.Features.Hotels
{
    public class SearchHotelsQueryHandlerTest
    {
        [Fact]
        public async Task Handle_ValidRequest_ReturnsHotelList()
        {
            var orchestratorMock = new Mock<IHotelSearchOrchestrator>();
            var expectedList = new List<HotelSearchResponseDto> { new HotelSearchResponseDto { Provider = "PremierStays" } };
            orchestratorMock.Setup(o => o.SearchAsync(It.IsAny<HotelSearchRequestDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedList);

            var handler = new SearchHotelsQueryHandler(orchestratorMock.Object);
            var query = new SearchHotelsQuery
            {
                Destination = "London",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                RoomType = null
            };

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("PremierStays", result[0].Provider);
        }

        [Fact]
        public async Task Handle_OrchestratorThrows_ThrowsException()
        {
            var orchestratorMock = new Mock<IHotelSearchOrchestrator>();
            orchestratorMock.Setup(o => o.SearchAsync(It.IsAny<HotelSearchRequestDto>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Search failed"));

            var handler = new SearchHotelsQueryHandler(orchestratorMock.Object);
            var query = new SearchHotelsQuery
            {
                Destination = "London",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                RoomType = null
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(query, CancellationToken.None));
        }
    }
}
