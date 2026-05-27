namespace HotelStay.Domain.Entities
{
    public class Destination
    {
        public int Id { get; set; }

        public string City { get; set; } = default!;

        public string Country { get; set; } = default!;

        public bool IsDomestic { get; set; }
    }
}
