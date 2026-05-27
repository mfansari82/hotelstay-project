using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.DTOs
{
    public class BookingResponseDto
    {
        public string ReferenceNumber { get; set; } = default!;

        public string Provider { get; set; } = default!;

        public decimal TotalPrice { get; set; }

        public string Status { get; set; } = default!;
    }
}
