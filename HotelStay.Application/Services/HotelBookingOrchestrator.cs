using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;

namespace HotelStay.Application.Services
{
    public class HotelBookingOrchestrator : IHotelBookingOrchestrator
    {
        private readonly IEnumerable<IHotelProvider> _providers;

        public HotelBookingOrchestrator(IEnumerable<IHotelProvider> providers)
        {
            _providers = providers;
        }

        public async Task<BookingResponseDto> BookAsync(BookingRequestDto request, CancellationToken cancellationToken = default)
        {
            var provider = _providers.FirstOrDefault(p => p.ProviderName.Equals(request.Provider, StringComparison.OrdinalIgnoreCase));
            if (provider == null)
                throw new InvalidOperationException($"Provider '{request.Provider}' not found.");

            var response = await provider.BookAsync(request, cancellationToken);
            response.Provider = provider.ProviderName;
            return response;
        }
    }
}
