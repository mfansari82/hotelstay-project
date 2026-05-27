using HotelStay.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.DTOs
{
    public class BookingRequestDto
    {
        public string Provider { get; set; } = default!;

        public string HotelName { get; set; } = default!;

        public string PassengerName { get; set; } = default!;

        public DocumentType DocumentType { get; set; }

        public string DocumentNumber { get; set; } = default!;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public RoomType RoomType { get; set; }
        public decimal PricePerNight { get; set; }
        //public int HotelId { get; set; }
        public int NumberOfGuests { get; set; }
        public string Destination { get; set; }
    }
}
