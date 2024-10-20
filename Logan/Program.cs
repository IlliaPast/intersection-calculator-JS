var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

// ������ �������� ���������� �� CORS ��� ������ � localhost:48640
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", builder =>
    {
        builder.WithOrigins("http://localhost:48640")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddControllers(); // ������ ����������

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowLocalhost"); // ������ CORS ��� ������ � localhost:48640

app.UseAuthorization();

// ϳ�������� Razor Pages �� ����������
app.MapRazorPages();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
