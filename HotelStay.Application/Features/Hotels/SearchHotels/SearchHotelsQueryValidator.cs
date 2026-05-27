using FluentValidation;
using HotelStay.Application.Features.Hotels.SearchHotels;

namespace HotelStay.Application.Features.Hotels.SearchHotels
{
    public class SearchHotelsQueryValidator : AbstractValidator<SearchHotelsQuery>
    {
        public SearchHotelsQueryValidator()
        {
            RuleFor(x => x.Destination)
                .NotEmpty().WithMessage("Destination is required.");

            RuleFor(x => x.CheckIn)
                .NotEmpty().WithMessage("Check-in date is required.")
                .LessThan(x => x.CheckOut).WithMessage("Check-in date must be before check-out date.");

            RuleFor(x => x.CheckOut)
                .NotEmpty().WithMessage("Check-out date is required.");
        }
    }
}