using HotelStay.Domain.Enums;

namespace HotelStay.Domain.Entities
{
    public class Booking
    {
        public Guid Id { get; set; }
        public string ReferenceNumber { get; set; } = default!;
        public string PassengerName { get; set; } = default!;
        public string DocumentNumber { get; set; } = default!;
        public DocumentType DocumentType { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public decimal TotalPrice { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // Foreign key to Hotel
        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = default!;
    }
}
