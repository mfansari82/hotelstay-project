using HotelStay.Application.DTOs;
using HotelStay.Domain.Entities;
using HotelStay.Domain.Enums;
using HotelStay.Infrastructure.Persistence;
using HotelStay.Infrastructure.Providers;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelStay.Tests.InfrastuctureProvider
{
    public class PremierStaysProviderTests
    {
        private readonly ApplicationDbContext _context;
        private readonly PremierStaysProvider _provider;

        public PremierStaysProviderTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _provider = new PremierStaysProvider(_context);
        }

        [Fact]
        public async Task SearchAsync_ValidRequest_ReturnsHotels()
        {
            // Arrange
            _context.Hotels.Add(new Hotel
            {
                Id = 1,
                Name = "Premier Hotel",
                City = "Paris",
                ProviderName = "PremierStays",
                RoomType = RoomType.Standard,
                PricePerNight = 200,
                IsAvailable = true
            });
            await _context.SaveChangesAsync();

            var request = new HotelSearchRequestDto
            {
                Destination = "Paris",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2)
            };

            // Act
            var results = await _provider.SearchAsync(request);

            // Assert
            Assert.Single(results);
            Assert.Equal("PremierStays", results[0].Provider);
        }

        [Fact]
        public async Task BookAsync_ValidRequest_ReturnsBookingResponse()
        {
            // Arrange
            _context.Hotels.Add(new Hotel
            {
                Id = 1,
                Name = "Premier Hotel",
                City = "Paris",
                ProviderName = "PremierStays",
                RoomType = RoomType.Standard,
                PricePerNight = 200,
                IsAvailable = true
            });
            await _context.SaveChangesAsync();

            var request = new BookingRequestDto
            {
                HotelName = "Premier Hotel",
                Destination = "Paris",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                PassengerName = "John Doe",
                DocumentType = DocumentType.Passport,
                DocumentNumber = "A1234567"
            };

            // Act
            var response = await _provider.BookAsync(request);

            // Assert
            Assert.NotNull(response.ReferenceNumber);
            Assert.Equal("PremierStays", response.Provider);
        }

        [Fact]
        public async Task BookAsync_HotelNotFound_ThrowsKeyNotFoundException()
        {
            // Arrange
            var request = new BookingRequestDto
            {
                HotelName = "Invalid",
                Destination = "Paris",
                CheckIn = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                PassengerName = "John Doe",
                DocumentType = DocumentType.Passport,
                DocumentNumber = "A1234567"
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _provider.BookAsync(request));
        }

        [Fact]
        public async Task GetBookingAsync_ValidReference_ReturnsBookingStatus()
        {
            // Arrange
            _context.Bookings.Add(new Booking
            {
                DocumentNumber = "testPremierDocNumber",
                PassengerName = "TestPremierPassengerName",
                ReferenceNumber = "REF123",
                Status = BookingStatus.Confirmed
            });
            await _context.SaveChangesAsync();

            // Act
            var status = await _provider.GetBookingAsync("REF123");

            // Assert
            Assert.Equal("REF123", status.ReferenceNumber);
            Assert.Equal(BookingStatus.Confirmed, status.Status);
        }

        [Fact]
        public async Task GetBookingAsync_InvalidReference_ThrowsKeyNotFoundException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _provider.GetBookingAsync("INVALID_REF"));
        }
    }
}
