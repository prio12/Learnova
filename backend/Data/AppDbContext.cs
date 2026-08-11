using Microsoft.EntityFrameworkCore;
using Learnova.Models;

namespace Learnova.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<Submission> Submissions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<User>()
        .HasIndex(u => u.Email)
        .IsUnique();

        modelBuilder.Entity<Subject>()
        .HasOne(s => s.Course)
        .WithMany()
        .HasForeignKey(s => s.CourseId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Subject>()
        .HasIndex(s => new { s.Name, s.CourseId })
        .IsUnique();

        modelBuilder.Entity<Subject>()
        .HasOne(s => s.Teacher)
        .WithMany()
        .HasForeignKey(s => s.TeacherId);


        modelBuilder.Entity<Enrollment>()
        .HasOne(e => e.Student)
        .WithMany()
        .HasForeignKey(e => e.StudentId);


        modelBuilder.Entity<Enrollment>()
        .HasOne(e => e.Course)
        .WithMany()
        .HasForeignKey(e => e.CourseId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
        .HasIndex(e => new { e.CourseId, e.StudentId })
        .IsUnique();

        modelBuilder.Entity<Assignment>()
        .HasOne(a => a.Course)
        .WithMany()
        .HasForeignKey(a => a.CourseId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Assignment>()
        .HasOne(a => a.Teacher)
        .WithMany()
        .HasForeignKey(a => a.TeacherId);

        modelBuilder.Entity<Assignment>()
        .HasOne(a => a.Subject)
        .WithMany()
        .HasForeignKey(a => a.SubjectId);

        modelBuilder.Entity<Submission>()
        .HasOne(s => s.Assignment)
        .WithMany()
        .HasForeignKey(s => s.AssignmentId);

        modelBuilder.Entity<Submission>()
        .HasOne(s => s.Student)
        .WithMany()
        .HasForeignKey(s => s.StudentId);

        modelBuilder.Entity<Submission>()
        .HasIndex(s => new { s.AssignmentId, s.StudentId })
        .IsUnique();
    }
}