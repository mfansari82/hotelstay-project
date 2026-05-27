using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;

namespace HotelStay.Application.Services
{
    public class HotelBookingStatusOrchestrator : IHotelBookingStatusOrchestrator
    {
        private readonly IEnumerable<IHotelProvider> _providers;

        public HotelBookingStatusOrchestrator(IEnumerable<IHotelProvider> providers)
        {
            _providers = providers;
        }

        public async Task<BookingStatusDto> GetBookingStatusAsync(string reference, string provider, CancellationToken cancellationToken = default)
        {
            var selectedProvider = _providers.FirstOrDefault(p => p.ProviderName.Equals(provider, StringComparison.OrdinalIgnoreCase));
            if (selectedProvider == null)
                throw new InvalidOperationException($"Provider '{provider}' not found.");

            var status = await selectedProvider.GetBookingAsync(reference, cancellationToken);
            status.ReferenceNumber = reference;
            return status;
        }
    }
}
