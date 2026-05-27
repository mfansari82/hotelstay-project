using HotelStay.Domain.Enums;

namespace HotelStay.Application.Features.Hotels.GetBooking
{
    public class GetBookingResponse
    {
        public string ReferenceNumber { get; set; }
        public BookingStatus Status { get; set; }
        public string Provider { get; set; }
    }
}
