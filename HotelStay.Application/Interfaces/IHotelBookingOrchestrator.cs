using HotelStay.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.Interfaces
{
    public interface IHotelBookingOrchestrator
    {
        Task<BookingResponseDto> BookAsync(BookingRequestDto request, CancellationToken cancellationToken = default);
    }
}
