using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Constants;
using ProductCatalogService.Application.Features.Categories;

namespace ProductCatalogService.API.Controllers;

[ApiController]
public sealed class CategoriesController(ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpPost(ApiRoutes.Categories.Create)]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetAll), new { categoryId = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpGet(ApiRoutes.Categories.GetAll)]
    public async Task<IActionResult> GetAll()
    {
        var query = new GetAllCategoriesQuery();
        var result = await _sender.Send(query);
        return Ok(result.Value);
    }
}
