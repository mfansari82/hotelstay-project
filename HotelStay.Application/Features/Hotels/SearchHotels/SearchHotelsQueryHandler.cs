using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;
using MediatR;

namespace HotelStay.Application.Features.Hotels.SearchHotels
{
    public class SearchHotelsQueryHandler : IRequestHandler<SearchHotelsQuery, List<HotelSearchResponseDto>>
    {
        private readonly IHotelSearchOrchestrator _orchestrator;

        public SearchHotelsQueryHandler(IHotelSearchOrchestrator orchestrator)
        {
            _orchestrator = orchestrator;
        }

        public async Task<List<HotelSearchResponseDto>> Handle(SearchHotelsQuery request, CancellationToken cancellationToken)
        {
            // Call the orchestrator to get the aggregated and normalized results
            return await _orchestrator.SearchAsync(new HotelSearchRequestDto
            {
                Destination = request.Destination,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                RoomType = request.RoomType
            }, cancellationToken);
        }
    }
}