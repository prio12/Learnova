using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Learnova.Models;
using Microsoft.IdentityModel.Tokens;

namespace Learnova.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;
    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    public string GenerateToken(User user)
    {
        var key = _configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("JWT key is not configured.");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var securityKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(key)
);

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
    claims: claims,
    expires: DateTime.UtcNow.AddHours(48),
    signingCredentials: credentials
);

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(token);
    }
}