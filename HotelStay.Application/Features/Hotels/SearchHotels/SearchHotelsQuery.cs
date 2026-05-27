using HotelStay.Application.DTOs;
using HotelStay.Domain.Enums;
using MediatR;

namespace HotelStay.Application.Features.Hotels.SearchHotels
{
    public class SearchHotelsQuery : IRequest<List<HotelSearchResponseDto>>
    {
        public string Destination { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public RoomType? RoomType { get; set; }
    }
}
