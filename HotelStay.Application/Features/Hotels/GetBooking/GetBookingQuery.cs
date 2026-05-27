using MediatR;

namespace HotelStay.Application.Features.Hotels.GetBooking
{
    public record GetBookingQuery(string Reference, string Provider) : IRequest<GetBookingResponse>;
}
