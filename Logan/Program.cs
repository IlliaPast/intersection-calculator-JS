var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

// Додаємо підтримку контролерів та CORS для запитів з localhost:48640
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", builder =>
    {
        builder.WithOrigins("http://localhost:48640")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddControllers(); // Додаємо контролери

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowLocalhost"); // Додаємо CORS для запитів з localhost:48640

app.UseAuthorization();

// Підключаємо Razor Pages та контролери
app.MapRazorPages();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
