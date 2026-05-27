using HotelStay.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.DTOs
{
    public class HotelSearchRequestDto
    {
        public string Destination { get; set; } = default!;

        public DateTime CheckIn { get; set; }

        public DateTime CheckOut { get; set; }

        public RoomType? RoomType { get; set; }
    }
}
