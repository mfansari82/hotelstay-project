using HotelStay.Application.Interfaces;
using MediatR;

namespace HotelStay.Application.Features.Hotels.GetBooking
{
    public class GetBookingHandler : IRequestHandler<GetBookingQuery, GetBookingResponse>
    {
        private readonly IHotelBookingStatusOrchestrator _orchestrator;

        public GetBookingHandler(IHotelBookingStatusOrchestrator orchestrator)
        {
            _orchestrator = orchestrator;
        }

        public async Task<GetBookingResponse> Handle(GetBookingQuery request, CancellationToken cancellationToken)
        {
            var bookingStatus = await _orchestrator.GetBookingStatusAsync(request.Reference, request.Provider, cancellationToken);

            return new GetBookingResponse
            {
                ReferenceNumber = bookingStatus.ReferenceNumber,
                Status = bookingStatus.Status,
                Provider = request.Provider
            };
        }
    }
}
