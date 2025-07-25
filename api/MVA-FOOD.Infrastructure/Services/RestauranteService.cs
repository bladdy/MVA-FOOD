using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class RestauranteService : IRestauranteService
{
    private readonly AppDbContext _context;

    public RestauranteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RestauranteDto>> GetAllAsync()
    {
        return await _context.Restaurantes
            .Select(r => new RestauranteDto
            {
                Id = r.Id,
                Name = r.Name,
                Image = r.Image,
                PerfilImage = r.PerfilImage,
                Direccion = r.Direccion,
                Phone = r.Phone,
                PlanId = r.PlanId
            }).ToListAsync();
    }

    public async Task<RestauranteDto> GetByIdAsync(Guid id)
    {
        var r = await _context.Restaurantes.FindAsync(id);
        if (r == null) return null;

        return new RestauranteDto
        {
            Id = r.Id,
            Name = r.Name,
            Image = r.Image,
            PerfilImage = r.PerfilImage,
            Direccion = r.Direccion,
            Phone = r.Phone,
            PlanId = r.PlanId
        };
    }

    public async Task<RestauranteDto> CreateAsync(CreateRestauranteDto dto)
    {
        var r = new Restaurante
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Image = dto.Image,
            PerfilImage = dto.PerfilImage,
            Direccion = dto.Direccion,
            Phone = dto.Phone,
            PlanId = dto.PlanId
        };

        _context.Restaurantes.Add(r);
        await _context.SaveChangesAsync();

        return new RestauranteDto
        {
            Id = r.Id,
            Name = r.Name,
            Image = r.Image,
            PerfilImage = r.PerfilImage,
            Direccion = r.Direccion,
            Phone = r.Phone,
            PlanId = r.PlanId
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var r = await _context.Restaurantes.FindAsync(id);
        if (r == null) return false;

        _context.Restaurantes.Remove(r);
        await _context.SaveChangesAsync();
        return true;
    }
}

}