using FluentAssertions;
using ProductCatalogService.Domain.Entities;

namespace ProductCatalogService.UnitTests.Domain;

public class ProductDomainTests
{
    private readonly Guid _categoryId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldInitializeCorrectly()
    {
        // Act
        var product = Product.Create(
            "Test Product",
            "A great product for testing",
            "SKU-TEST-001",
            29.99m,
            _categoryId);

        // Assert
        product.Should().NotBeNull();
        product.Name.Should().Be("Test Product");
        product.Description.Should().Be("A great product for testing");
        product.Sku.Should().Be("SKU-TEST-001");
        product.Price.Should().Be(29.99m);
        product.CategoryId.Should().Be(_categoryId);
        product.IsActive.Should().BeTrue();
        product.Tags.Should().BeEmpty();
        product.ImageUrl.Should().BeNull();
    }

    [Fact]
    public void Create_ShouldDefaultToActive()
    {
        // Act
        var product = Product.Create("Active Product", "Desc", "SKU-ACT", 10m, _categoryId);

        // Assert
        product.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Product_ShouldAllowTagModifications()
    {
        // Arrange
        var product = Product.Create("Tagged Product", "Desc", "SKU-TAG", 15m, _categoryId);

        // Act
        product.Tags.Add("electronics");
        product.Tags.Add("sale");

        // Assert
        product.Tags.Should().HaveCount(2);
        product.Tags.Should().Contain("electronics");
        product.Tags.Should().Contain("sale");
    }

    [Fact]
    public void Product_ShouldAllowPriceUpdates()
    {
        // Arrange
        var product = Product.Create("Priced Product", "Desc", "SKU-PRICE", 100m, _categoryId);

        // Act
        product.Price = 89.99m;

        // Assert
        product.Price.Should().Be(89.99m);
    }

    [Fact]
    public void Product_ShouldAllowDeactivation()
    {
        // Arrange
        var product = Product.Create("Deactivatable", "Desc", "SKU-DEACT", 50m, _categoryId);

        // Act
        product.IsActive = false;

        // Assert
        product.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Product_ShouldAllowImageUrlUpdate()
    {
        // Arrange
        var product = Product.Create("Image Product", "Desc", "SKU-IMG", 25m, _categoryId);

        // Act
        product.ImageUrl = "https://example.com/image.jpg";

        // Assert
        product.ImageUrl.Should().Be("https://example.com/image.jpg");
    }
}
