using FluentValidation;
using HotelStay.Domain.Enums;

namespace HotelStay.Application.Features.Hotels.BookHotel
{
    public class BookHotelCommandValidator : AbstractValidator<BookHotelCommand>
    {
        private readonly List<string> _domesticDestinations = new() { "Mumbai", "Delhi" };
        private readonly List<string> _internationalDestinations = new() { "New York", "London", "Paris" };

        public BookHotelCommandValidator()
        {
            RuleFor(x => x.Provider)
                .NotEmpty().WithMessage("Provider is required.");

            RuleFor(x => x.HotelName)
                .NotEmpty().WithMessage("Hotel Name is required.");

            RuleFor(x => x.CheckIn)
                .NotEmpty().WithMessage("Check-in date is required.")
                .LessThan(x => x.CheckOut).WithMessage("Check-in date must be before check-out date.");

            RuleFor(x => x.CheckOut)
                .NotEmpty().WithMessage("Check-out date is required.");

            RuleFor(x => x.PassengerName)
                .NotEmpty().WithMessage("Passenger name is required.");

            RuleFor(x => x.DocumentNumber)
                .NotEmpty().WithMessage("Document number is required.");

            RuleFor(x => x)
                .Must(ValidateDocumentType)
                .WithMessage("Invalid document type for the selected destination.");
        }

        private bool ValidateDocumentType(BookHotelCommand command)
        {
            if (_domesticDestinations.Contains(command.Destination, StringComparer.OrdinalIgnoreCase))
            {
                return command.DocumentType == DocumentType.NationalId;
            }

            if (_internationalDestinations.Contains(command.Destination, StringComparer.OrdinalIgnoreCase))
            {
                return command.DocumentType == DocumentType.Passport;
            }

            // If the destination is not in the domestic or international list, validation fails
            return false;
        }
    }
}