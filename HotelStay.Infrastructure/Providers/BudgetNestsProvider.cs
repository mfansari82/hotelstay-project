using HotelStay.Application.DTOs;
using HotelStay.Application.Interfaces;
using HotelStay.Domain.Entities;
using HotelStay.Domain.Enums;
using HotelStay.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelStay.Infrastructure.Providers
{
    public class BudgetNestsProvider : IHotelProvider
    {
        public string ProviderName => "BudgetNests";
        private readonly ApplicationDbContext _context;

        public BudgetNestsProvider(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<HotelSearchResponseDto>> SearchAsync(HotelSearchRequestDto request, CancellationToken cancellationToken = default)
        {
            // Fetch data from the Hotels table
            var results = await _context.Hotels
                .Where(h => h.City == request.Destination && h.ProviderName == ProviderName && h.RoomType == request.RoomType)
                .Select(h => new HotelSearchResponseDto
                {
                    Provider = h.ProviderName,
                    HotelName = h.Name,
                    RoomType = h.RoomType,
                    PricePerNight = h.PricePerNight,
                    TotalPrice = h.PricePerNight * (request.CheckOut - request.CheckIn).Days,
                    CancellationPolicy = h.CancellationPolicy,
                    Amenities = h.Amenities,
                    StarRating = h.StarRating,
                    IsAvailable = h.IsAvailable
                })
                .ToListAsync(cancellationToken);

            return results;
        }

        public async Task<BookingResponseDto> BookAsync(BookingRequestDto request, CancellationToken cancellationToken = default)
        {
            // Save booking to the database

            // Fetch the hotel from the database
            var hotel = await _context.Hotels
                .FirstOrDefaultAsync(h => h.Name == request.HotelName && h.ProviderName == ProviderName, cancellationToken);

            if (hotel == null)
            {
                throw new KeyNotFoundException("Hotel not found.");
            }

            // Save booking to the database
            var booking = new Booking
            {
                HotelId = hotel.Id,
                PassengerName = request.PassengerName,
                ReferenceNumber = Guid.NewGuid().ToString(),
                DocumentType = request.DocumentType,
                DocumentNumber = request.DocumentNumber,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                TotalPrice = hotel.PricePerNight * (request.CheckOut - request.CheckIn).Days,
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync(cancellationToken);

            return new BookingResponseDto
            {
                ReferenceNumber = booking.ReferenceNumber,
                Provider = ProviderName,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString()
            };
        }

        public async Task<BookingStatusDto> GetBookingAsync(string reference, CancellationToken cancellationToken = default)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.ReferenceNumber == reference, cancellationToken);

            if (booking == null)
            {
                throw new KeyNotFoundException("Booking not found.");
            }

            return new BookingStatusDto
            {
                ReferenceNumber = booking.ReferenceNumber,
                Status = booking.Status
            };
        }
    }
}
