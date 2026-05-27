using HotelStay.Domain.Entities;
using HotelStay.Domain.Enums;
using HotelStay.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HotelStay.Infrastructure.Seed
{
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public DatabaseSeeder(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task SeedAsync()
        {
            // Check if seeding is enabled in appsettings.json
            var seedDataEnabled = _configuration.GetValue<bool>("SeedData:Enabled");
            if (!seedDataEnabled) return;

            // Check if the table exists
            if (!await _context.Database.CanConnectAsync())
            {
                await _context.Database.EnsureCreatedAsync();
            }

            // Seed Destinations
            if (!await _context.Destinations.AnyAsync())
            {
                var destinations = new List<Destination>
                    {
                        new Destination { City = "New York", Country = "USA", IsDomestic = false },
                        new Destination { City = "London", Country = "UK", IsDomestic = false },
                        new Destination { City = "Paris", Country = "France", IsDomestic = false },
                        new Destination { City = "Mumbai", Country = "India", IsDomestic = true },
                        new Destination { City = "Delhi", Country = "India", IsDomestic = true }
                    };

                _context.Destinations.AddRange(destinations);
                await _context.SaveChangesAsync();
            }

            // Seed Hotels
            if (!await _context.Set<Hotel>().AnyAsync())
            {
                var hotels = new List<Hotel>
                {
                    new Hotel
                    {
                        Name = "Luxury Hotel",
                        ProviderName = "PremierStays",
                        RoomType = RoomType.Deluxe,
                        PricePerNight = 150,
                        CancellationPolicy = CancellationPolicy.FreeCancellation,
                        Amenities = new List<string> { "WiFi", "Pool", "Gym" },
                        StarRating = 5,
                        City = "New York",
                        IsAvailable = true
                    },
                    new Hotel
                    {
                        Name = "Budget Hotel",
                        ProviderName = "BudgetNests",
                        RoomType = RoomType.Standard,
                        PricePerNight = 80,
                        CancellationPolicy = CancellationPolicy.Flexible,
                        Amenities = null,
                        StarRating = null,
                        City = "London",
                        IsAvailable = true
                    },
                    new Hotel
                    {
                        Name = "Taj Hotel",
                        ProviderName = "PremierStays",
                        RoomType = RoomType.Suite,
                        PricePerNight = 1500,
                        CancellationPolicy = CancellationPolicy.FreeCancellation,
                        Amenities = new List<string> { "WiFi", "Pool", "Gym" },
                        StarRating = 5,
                        City = "Mumbai",
                        IsAvailable = true
                    },
                    new Hotel
                    {
                        Name = "Swagat Hotel",
                        ProviderName = "BudgetNests",
                        RoomType = RoomType.Standard,
                        PricePerNight = 80,
                        CancellationPolicy = CancellationPolicy.Flexible,
                        Amenities = null,
                        StarRating = null,
                        City = "Mumbai",
                        IsAvailable = true
                    },
                    new Hotel
                    {
                        Name = "Decent Hotel",
                        ProviderName = "BudgetNests",
                        RoomType = RoomType.Standard,
                        PricePerNight = 300,
                        CancellationPolicy = CancellationPolicy.Flexible,
                        Amenities = null,
                        StarRating = null,
                        City = "Mumbai",
                        IsAvailable = true
                    },
                    new Hotel
                    {
                        Name = "ITC Hotel",
                        ProviderName = "PremierStays",
                        RoomType = RoomType.Deluxe,
                        PricePerNight = 2000,
                        CancellationPolicy = CancellationPolicy.FreeCancellation,
                        Amenities = new List<string> { "WiFi", "Pool", "Gym" },
                        StarRating = 5,
                        City = "Delhi",
                        IsAvailable = true
                    },
                };

                _context.Set<Hotel>().AddRange(hotels);
                await _context.SaveChangesAsync();
            }

            // Seed Bookings
            if (!await _context.Bookings.AnyAsync())
            {
                var luxuryHotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Name == "Luxury Hotel");
                var budgetHotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Name == "Budget Hotel");
                var domesticHotel = await _context.Hotels.FirstOrDefaultAsync(h => h.Name == "Taj Hotel");

                var bookings = new List<Booking>
                {
                    new Booking
                    {
                        HotelId = luxuryHotel!.Id,
                        ReferenceNumber = Guid.NewGuid().ToString(),
                        PassengerName = "John Doe",
                        DocumentType = DocumentType.Passport,
                        DocumentNumber = "A12345678",
                        CheckIn = DateTime.Today.AddDays(1),
                        CheckOut = DateTime.Today.AddDays(3),
                        TotalPrice = 500,
                        Status = BookingStatus.Confirmed,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Booking
                    {
                        HotelId = budgetHotel!.Id,
                        ReferenceNumber = Guid.NewGuid().ToString(),
                        PassengerName = "Jane Doe",
                        DocumentType = DocumentType.Passport,
                        DocumentNumber = "ID12345678",
                        CheckIn = DateTime.Today.AddDays(2),
                        CheckOut = DateTime.Today.AddDays(5),
                        TotalPrice = 300,
                        Status = BookingStatus.Pending,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Booking
                    {
                        HotelId = domesticHotel!.Id,
                        ReferenceNumber = Guid.NewGuid().ToString(),
                        PassengerName = "Abhishek Pandey",
                        DocumentType = DocumentType.NationalId,
                        DocumentNumber = "NID345678",
                        CheckIn = DateTime.Today.AddDays(2),
                        CheckOut = DateTime.Today.AddDays(5),
                        TotalPrice = 300,
                        Status = BookingStatus.Confirmed,
                        CreatedAt = DateTime.UtcNow
                    }
                };
                _context.Bookings.AddRange(bookings);
                await _context.SaveChangesAsync();
            }

        }
    }
}
