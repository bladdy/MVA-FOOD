namespace MVA_FOOD.Core.Interfaces
{
    public interface IVencimientoService
    {
        Task<int> GenerarFacturasVencidasAsync();
        Task<int> DesactivarPlanesVencidosAsync();
    }
}
