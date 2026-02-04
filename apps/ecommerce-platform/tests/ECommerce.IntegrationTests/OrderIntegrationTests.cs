using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using FluentAssertions;
using Microsoft.IdentityModel.Tokens;
using OrderService.Application.Features;
using Shared.Common.Constants;

namespace ECommerce.IntegrationTests;

public class OrderIntegrationTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly IntegrationTestWebAppFactory _factory;
    private readonly HttpClient _client;

    public OrderIntegrationTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private string GenerateJwtToken()
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super_secret_testing_key_1234567890"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Email, "test@example.com"),
            new Claim("role", "Customer")
        };

        var token = new JwtSecurityToken(
            issuer: "ecommerce",
            audience: "ecommerce",
            claims: claims,
            expires: DateTime.Now.AddMinutes(10),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Fact]
    public async Task PlaceOrder_ShouldReturnCreated_AndPersistOrder()
    {
        // Arrange
        var token = GenerateJwtToken();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var command = new PlaceOrderCommand(
            Guid.NewGuid(),
            [
                new OrderItemRequest(Guid.NewGuid(), "Integration Product", 50.00m, 2)
            ],
            new AddressRequest("Test St", "Test City", "TS", "12345", "Test Country")
        );

        // Act
        var response = await _client.PostAsJsonAsync(ApiRoutes.Orders.Base, command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var result = await response.Content.ReadFromJsonAsync<CreatedResponse>();
        result.Should().NotBeNull();
        result!.OrderId.Should().NotBeEmpty();

        // Verify we can get the order
        var getResponse = await _client.GetAsync(ApiRoutes.Orders.GetById.Replace("{id}", result.OrderId.ToString()));
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // Helper record to match the anonymous type returned by CreatedAtAction
    private record CreatedResponse(Guid OrderId);
}
