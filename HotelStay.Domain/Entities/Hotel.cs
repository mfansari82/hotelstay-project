using HotelStay.Domain.Enums;

namespace HotelStay.Domain.Entities
{
    public class Hotel
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string ProviderName { get; set; } = default!;
        public RoomType RoomType { get; set; }
        public decimal PricePerNight { get; set; }
        public CancellationPolicy CancellationPolicy { get; set; }
        public List<string>? Amenities { get; set; }
        public int? StarRating { get; set; }
        public string City { get; set; } = default!;
        public bool IsAvailable { get; set; }

        // Navigation property for related bookings
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
