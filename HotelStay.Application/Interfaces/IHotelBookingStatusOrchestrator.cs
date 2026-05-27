using HotelStay.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Application.Interfaces
{
    public interface IHotelBookingStatusOrchestrator
    {
        Task<BookingStatusDto> GetBookingStatusAsync(string reference, string provider, CancellationToken cancellationToken = default);
    }
}
