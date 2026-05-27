using HotelStay.Domain.Enums;

namespace HotelStay.Application.DTOs
{
    public class HotelSearchResponseDto
    {
        public string Provider { get; set; } = default!;

        public string HotelName { get; set; } = default!;

        public RoomType RoomType { get; set; }

        public decimal PricePerNight { get; set; }

        public decimal TotalPrice { get; set; }

        public CancellationPolicy CancellationPolicy { get; set; } = default!;

        public List<string>? Amenities { get; set; }

        public int? StarRating { get; set; }
        public bool IsAvailable { get; set; }
    }
}
