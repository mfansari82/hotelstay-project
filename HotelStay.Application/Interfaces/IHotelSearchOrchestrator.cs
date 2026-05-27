using HotelStay.Application.DTOs;

namespace HotelStay.Application.Interfaces
{
    public interface IHotelSearchOrchestrator
    {
        Task<List<HotelSearchResponseDto>> SearchAsync(HotelSearchRequestDto request, CancellationToken cancellationToken = default);
    }
}
