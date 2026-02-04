using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;

namespace ECommerce.E2E.Tests;

public class FullFlowTests : IClassFixture<E2ETestFixture>
{
    private readonly E2ETestFixture _fixture;
    private readonly HttpClient _client;

    public FullFlowTests(E2ETestFixture fixture)
    {
        _fixture = fixture;
        _client = fixture.Client;
    }

    [Fact]
    public async Task VerifySystemFlow_ShouldSucceed()
    {
        // Allow services to settle after startup
        await Task.Delay(5000);

        // 1. Register Regular User
        var email = $"verify-user-{Guid.NewGuid()}@example.com";
        var password = "TestPass123!";
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Test",
            LastName = "User"
        });

        // If 500/ConnectionRefused, the test fails, indicating environment not up.
        registerResponse.EnsureSuccessStatusCode();
        var registerResult = await registerResponse.Content.ReadFromJsonAsync<RegisterResponse>();
        var userId = registerResult!.UserId;

        // 2. Login as Regular User
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        });
        loginResponse.EnsureSuccessStatusCode();
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        var userToken = loginResult!.AccessToken;

        var userClient = new HttpClient { BaseAddress = _client.BaseAddress };
        userClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

        // 3. Login as Admin
        var adminLoginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "admin@ecommerce.com",
            Password = "AdminPass123!"
        });
        // Note: This relies on the system being seeded.
        adminLoginResponse.EnsureSuccessStatusCode();
        var adminLoginResult = await adminLoginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        var adminToken = adminLoginResult!.AccessToken;

        var adminClient = new HttpClient { BaseAddress = _client.BaseAddress };
        adminClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 4. Security Check (Regular User Forbidden)
        var forbiddenResponse = await userClient.PostAsJsonAsync("/api/categories", new
        {
            Name = "HackerCat",
            Description = "Malicious"
        });
        forbiddenResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 5. Admin Creates Category
        var categoryResponse = await adminClient.PostAsJsonAsync("/api/categories", new
        {
            Name = $"OfficialCat-{Guid.NewGuid()}",
            Description = "Admin Created"
        });
        categoryResponse.EnsureSuccessStatusCode();
        var categoryResult = await categoryResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        var categoryId = categoryResult!.CategoryId;

        // 6. Admin Creates Product
        var productResponse = await adminClient.PostAsJsonAsync("/api/products", new
        {
            Name = "OfficialProd",
            Description = "Admin Created",
            Price = 10.0,
            Sku = $"SKU-{Guid.NewGuid()}",
            StockQuantity = 100,
            CategoryId = categoryId,
            InitialStock = 100
        });
        productResponse.EnsureSuccessStatusCode();
        var productResult = await productResponse.Content.ReadFromJsonAsync<ProductResponse>();
        var productId = productResult!.ProductId;

        // 7. Regular User Adds to Cart
        var cartResponse = await userClient.PostAsJsonAsync("/api/cart/items", new
        {
            UserId = userId,
            ProductId = productId,
            ProductName = "OfficialProd",
            UnitPrice = 10.0,
            Quantity = 1
        });
        cartResponse.EnsureSuccessStatusCode();

        // 8. Regular User Places Order
        var orderResponse = await userClient.PostAsJsonAsync("/api/orders", new
        {
            UserId = userId,
            Items = new[]
            {
                new { ProductId = productId, ProductName = "OfficialProd", UnitPrice = 10.0, Quantity = 1 }
            },
            ShippingAddress = new
            {
                Street = "123 User St",
                City = "UserCity",
                State = "US",
                PostalCode = "11111",
                Country = "Userland"
            }
        });
        orderResponse.EnsureSuccessStatusCode();
        var orderResult = await orderResponse.Content.ReadFromJsonAsync<OrderResponse>();
        var orderId = orderResult!.OrderId != Guid.Empty ? orderResult.OrderId : orderResult.Id;

        // 9. Saga Check (Polling)
        var confirmed = false;
        for (var i = 0; i < 30; i++)
        {
            await Task.Delay(2000);
            var statusResponse = await userClient.GetAsync($"/api/orders/{orderId}");
            if (!statusResponse.IsSuccessStatusCode) continue;

            var statusResult = await statusResponse.Content.ReadFromJsonAsync<OrderStatusResponse>();
            if (statusResult!.Status.ToString() == "Confirmed" || statusResult.Status.ToString() == "1")
            {
                confirmed = true;
                break;
            }
        }

        confirmed.Should().BeTrue("Order should be confirmed within timeout");
    }

    // Helper classes
    record RegisterResponse(Guid UserId);
    record LoginResponse(string AccessToken);
    record CategoryResponse(Guid CategoryId);
    record ProductResponse(Guid ProductId);
    record OrderResponse(Guid Id, Guid OrderId);
    record OrderStatusResponse(object Status);
}
