using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;

namespace HotelStay.Application.Services
{
    public class HotelSearchOrchestrator : IHotelSearchOrchestrator
    {
        private readonly IEnumerable<IHotelProvider> _providers;

        public HotelSearchOrchestrator(IEnumerable<IHotelProvider> providers)
        {
            _providers = providers;
        }

        public async Task<List<HotelSearchResponseDto>> SearchAsync(HotelSearchRequestDto request, CancellationToken cancellationToken = default)
        {
            var allResults = new List<HotelSearchResponseDto>();

            foreach (var provider in _providers)
            {
                var providerResults = await provider.SearchAsync(request, cancellationToken);

                // Filter out unavailable rooms (if provider returns such info)
                var availableRooms = providerResults
                    .Where(r => r.IsAvailable)
                    .Select(r => NormalizeToUnifiedDto(r, provider.ProviderName, request))
                    .ToList();

                allResults.AddRange(availableRooms);
            }

            // Optionally, sort or further process results here
            return allResults;
        }

        private HotelSearchResponseDto NormalizeToUnifiedDto(HotelSearchResponseDto providerDto, string providerName, HotelSearchRequestDto request)
        {
            // This assumes each provider returns a HotelSearchResponseDto with all fields filled as per their own format.
            // You may need to map/copy/convert fields here if provider DTOs differ.
            return new HotelSearchResponseDto
            {
                Provider = providerName,
                HotelName = providerDto.HotelName,
                RoomType = providerDto.RoomType,
                PricePerNight = providerDto.PricePerNight,
                TotalPrice = providerDto.PricePerNight * (request.CheckOut - request.CheckIn).Days,
                CancellationPolicy = providerDto.CancellationPolicy,
                Amenities = providerDto.Amenities,
                StarRating = providerDto.StarRating,
                IsAvailable = providerDto.IsAvailable
            };
        }
    }
}
