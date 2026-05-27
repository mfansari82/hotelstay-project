using HotelStay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelStay.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<Destination> Destinations => Set<Destination>();
        public DbSet<Hotel> Hotels => Set<Hotel>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Booking-Hotel relationship
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Hotel)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HotelId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
