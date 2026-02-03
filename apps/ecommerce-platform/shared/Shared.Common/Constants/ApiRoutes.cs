namespace Shared.Common.Constants;

/// <summary>
/// API route constants for consistency across services
/// </summary>
public static class ApiRoutes
{
    public const string BaseUrl = "/api";

    public static class Auth
    {
        public const string Register = $"{BaseUrl}/auth/register";
        public const string Login = $"{BaseUrl}/auth/login";
        public const string Refresh = $"{BaseUrl}/auth/refresh";
        public const string Logout = $"{BaseUrl}/auth/logout";
    }

    public static class Users
    {
        public const string Base = $"{BaseUrl}/users";
        public const string GetById = $"{Base}/{{id}}";
        public const string UpdateProfile = $"{Base}/{{id}}";
    }

    public static class Products
    {
        public const string Base = $"{BaseUrl}/products";
        public const string GetById = $"{Base}/{{id}}";
        public const string Search = $"{Base}/search";
    }

    public static class Cart
    {
        public const string Base = $"{BaseUrl}/cart";
        public const string AddItem = $"{Base}/items";
        public const string UpdateItem = $"{Base}/items/{{productId}}";
        public const string RemoveItem = $"{Base}/items/{{productId}}";
    }

    public static class Orders
    {
        public const string Base = $"{BaseUrl}/orders";
        public const string GetById = $"{Base}/{{id}}";
        public const string History = $"{Base}/history";
        public const string Cancel = $"{Base}/{{id}}/cancel";
    }
}
