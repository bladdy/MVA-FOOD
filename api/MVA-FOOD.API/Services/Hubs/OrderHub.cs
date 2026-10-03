using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace MVA_FOOD.API.Services.Hubs;

public class OrderHub : Hub
{
    private const string GrupoPrefijo = "restaurant_";

    private Guid? RestauranteIdDeUsuario =>
        Guid.TryParse(Context.User?.FindFirstValue("restauranteId"), out var id) ? id : (Guid?)null;

    /// <summary>
    /// Al conectar, el cliente se agrega automáticamente al grupo de su restaurante
    /// derivado del claim JWT (restauranteId), sin depender de parámetros del cliente.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var rid = RestauranteIdDeUsuario;
        if (rid.HasValue)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"{GrupoPrefijo}{rid}");

        await base.OnConnectedAsync();
    }

    public async Task JoinRestaurantGroup(string restauranteId)
    {
        // El grupo se deriva de la sesión autenticada; el parámetro del cliente se ignora.
        var rid = RestauranteIdDeUsuario;
        if (rid.HasValue)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"{GrupoPrefijo}{rid}");
    }

    public async Task LeaveRestaurantGroup(string restauranteId)
    {
        var rid = RestauranteIdDeUsuario;
        if (rid.HasValue)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{GrupoPrefijo}{rid}");
    }
}