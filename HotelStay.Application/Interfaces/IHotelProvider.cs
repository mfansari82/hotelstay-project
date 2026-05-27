using HotelStay.Application.DTOs;

namespace HotelStay.Application.Interfaces
{
    public interface IHotelProvider
    {
        string ProviderName { get; }

        Task<List<HotelSearchResponseDto>> SearchAsync(
            HotelSearchRequestDto request, CancellationToken cancellationToken = default);

        Task<BookingResponseDto> BookAsync(
            BookingRequestDto request, CancellationToken cancellationToken = default);

        Task<BookingStatusDto> GetBookingAsync(
            string reference, CancellationToken cancellationToken = default);
    }
}
