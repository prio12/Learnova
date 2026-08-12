using Learnova.DTO.User;
using Learnova.Models;

namespace Learnova.Services;

public class PromoteUserResult
{
    public PromoteUserStatus Status { get; set; }
    public UserResponse? User { get; set; }
}