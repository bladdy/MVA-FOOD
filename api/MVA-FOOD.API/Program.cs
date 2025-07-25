using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using MVA_FOOD.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar DbContext (SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() // O usar .WithOrigins("http://localhost:4321") en producción
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Configurar Swagger (OpenAPI)
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Ejemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 4. Configurar controladores con JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 5. Servicios de la capa de aplicación (Inyección de dependencias)
builder.Services.AddScoped<IAmenidadService, AmenidadService>();
builder.Services.AddScoped<ICategoriaService, CategoriaService>();
builder.Services.AddScoped<IRestauranteService, RestauranteService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IMesaService, MesaService>();
builder.Services.AddScoped<IHorarioService, HorarioService>();
builder.Services.AddScoped<IEmpleadoService, EmpleadoService>();
builder.Services.AddScoped<IPlanService, PlanService>();
//builder.Services.AddScoped<IPlanRestauranteService, PlanRestauranteService>();

// 6. Configurar autorización y endpoints
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// 7. Configurar middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "MVA-FOOD API v1");
        options.RoutePrefix = string.Empty; // Swagger en la raíz
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app.MapControllers();

app.Run();
