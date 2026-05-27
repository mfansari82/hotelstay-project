using HotelStay.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.DTOs
{
    public class BookingStatusDto
    {
        public string ReferenceNumber { get; set; } = default!;

        public BookingStatus Status { get; set; } = default!;
    }
}
