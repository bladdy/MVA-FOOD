using Microsoft.AspNetCore.SignalR;

namespace MVA_FOOD.API.Services.Hubs;

public class OrderHub : Hub
{
    public async Task JoinRestaurantGroup(string restauranteId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"restaurant_{restauranteId}");
    }

    public async Task LeaveRestaurantGroup(string restauranteId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"restaurant_{restauranteId}");
    }
}
