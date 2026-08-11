using Microsoft.EntityFrameworkCore;
using Learnova.Data;
using Microsoft.AspNetCore.Identity;
using Learnova.Models;
using Learnova.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services
    .AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT key is not configured.");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(key)
    ),
            ValidateLifetime = true,
            ValidateIssuer = true,
            ValidIssuer = "Learnova",

            ValidateAudience = true,
            ValidAudience = "LearnovaClient",
        };
    });

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<SubjectService>();
builder.Services.AddScoped<AssignmentService>();
builder.Services.AddOpenApi();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();




