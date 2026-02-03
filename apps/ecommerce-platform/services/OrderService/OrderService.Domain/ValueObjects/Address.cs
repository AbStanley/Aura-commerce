using Shared.Domain.Entities;

namespace OrderService.Domain.ValueObjects;

public sealed class Address : ValueObject
{
    public required string Street { get; init; }
    public required string City { get; init; }
    public required string State { get; init; }
    public required string PostalCode { get; init; }
    public required string Country { get; init; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return PostalCode;
        yield return Country;
    }

    public static Address Create(string street, string city, string state, string postalCode, string country)
        => new()
        {
            Street = street,
            City = city,
            State = state,
            PostalCode = postalCode,
            Country = country
        };
}
