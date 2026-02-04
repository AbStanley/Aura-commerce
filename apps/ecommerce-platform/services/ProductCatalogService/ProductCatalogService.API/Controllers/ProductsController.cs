using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Shared.Common.Constants;
using ProductCatalogService.Application.Features.Products;

namespace ProductCatalogService.API.Controllers;

[ApiController]
public sealed class ProductsController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [Authorize(Roles = "Admin")]
    [HttpPost(ApiRoutes.Products.Create)]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, new { productId = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpGet(ApiRoutes.Products.GetById)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetProductQuery(id);
        var result = await _sender.Send(query);
        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(new { error = result.Error });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut(ApiRoutes.Products.Update)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var command = new UpdateProductCommand(id, request.Name, request.Description, request.Price);
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? Ok()
            : BadRequest(new { error = result.Error });
    }

    [HttpGet(ApiRoutes.Products.Search)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var query = new SearchProductsQuery(q);
        var result = await _sender.Send(query);
        return Ok(result.Value);
    }

    [HttpGet(ApiRoutes.Products.Base)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = new GetProductsQuery(page, pageSize);
        var result = await _sender.Send(query);
        return Ok(result.Value);
    }
}

public sealed record UpdateProductRequest(string Name, string Description, decimal Price);
