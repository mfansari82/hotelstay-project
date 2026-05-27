using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;
using MediatR;

namespace HotelStay.Application.Features.Hotels.BookHotel
{
    public class BookHotelHandler : IRequestHandler<BookHotelCommand, BookHotelResponse>
    {
        private readonly IHotelBookingOrchestrator _orchestrator;

        public BookHotelHandler(IHotelBookingOrchestrator orchestrator)
        {
            _orchestrator = orchestrator;
        }

        public async Task<BookHotelResponse> Handle(BookHotelCommand request, CancellationToken cancellationToken)
        {
            var bookingRequest = new BookingRequestDto
            {
                HotelName = request.HotelName,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                NumberOfGuests = request.NumberOfGuests == 0 ? 1 : request.NumberOfGuests,
                PassengerName = request.PassengerName,
                DocumentNumber = request.DocumentNumber,
                DocumentType = request.DocumentType,
                Provider = request.Provider,
                Destination = request.Destination
            };

            var bookingResponse = await _orchestrator.BookAsync(bookingRequest, cancellationToken);

            return new BookHotelResponse
            {
                ReferenceNumber = bookingResponse.ReferenceNumber,
                Status = bookingResponse.Status,
                Provider = bookingResponse.Provider
            };
        }
    }
}
