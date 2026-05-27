using HotelStay.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.Features.Hotels.BookHotel
{
    public record BookHotelCommand : IRequest<BookHotelResponse>
    {
        public string Provider { get; init; }
        public string HotelName { get; init; }
        public DateTime CheckIn { get; init; }
        public DateTime CheckOut { get; init; }
        public int NumberOfGuests { get; init; }
        public string PassengerName { get; set; }
        public string DocumentNumber { get; set; }
        public DocumentType DocumentType { get; set; }
        public string Destination { get; set; }
    }
}
