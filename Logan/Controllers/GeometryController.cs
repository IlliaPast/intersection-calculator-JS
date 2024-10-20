using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System;
using System.Drawing;
using System.Linq;

namespace YourApp.Controllers
{
    [ApiController]
    [Route("api/intersections")]
    public class IntersectionController : ControllerBase
    {
        // Метод для перевірки перетинів
        [HttpPost("check")]
        public IActionResult CheckIntersections([FromBody] IntersectionRequest request)
        {
            try
            {
                Console.WriteLine($"Перевірка перетинів для машини {request.CarNumber}:");

                // Логуємо точки машини
                foreach (var point in request.Car)
                {
                    Console.WriteLine($"Точка машини: X = {point.X}, Y = {point.Y}");
                }

                // Логуємо всі лінії
                if (request.Lines != null && request.Lines.Count > 0)
                {
                    Console.WriteLine("Отримані лінії:");
                    foreach (var line in request.Lines)
                    {
                        Console.WriteLine($"Лінія: Початок = ({line.StartX}, {line.StartY}), Кінець = ({line.EndX}, {line.EndY})");
                    }
                }
                else
                {
                    Console.WriteLine("Жодної лінії не отримано.");
                }

                var executionTime = System.Diagnostics.Stopwatch.StartNew();
                bool hasIntersection = false;
                List<PointF> intersectionPoints = new List<PointF>();

                // Перевірка перетину кожної лінії з машиною
                if (request.Lines != null && request.Lines.Count > 0)
                {
                    foreach (var line in request.Lines)
                    {
                        PointF lineStart = new PointF(line.StartX, line.StartY);
                        PointF lineEnd = new PointF(line.EndX, line.EndY);

                        // Логування координат лінії перед перевіркою перетину
                        Console.WriteLine($"Перевірка перетину лінії ({lineStart.X}, {lineStart.Y}) - ({lineEnd.X}, {lineEnd.Y}) з машиною...");

                        if (CheckCarIntersectionsWithLine(request.Car, lineStart, lineEnd, intersectionPoints))
                        {
                            hasIntersection = true;
                        }
                    }
                }

                executionTime.Stop();

                // Додаткове логування кількості знайдених перетинів
                Console.WriteLine($"Кількість знайдених перетинів: {intersectionPoints.Count}");

                return Ok(new
                {
                    message = hasIntersection ? $"Перетини знайдено для машини {request.CarNumber}!" : $"Перетинів для машини {request.CarNumber} немає.",
                    executionTime = executionTime.ElapsedMilliseconds,
                    intersections = intersectionPoints.Select(p => new { x = p.X, y = p.Y }).ToList()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Помилка: " + ex.Message);
                return StatusCode(500, "Помилка на сервері: " + ex.Message);
            }
        }

        // Метод для перевірки перетинів між лінією та відрізками, що формують машину
        private bool CheckCarIntersectionsWithLine(List<Point> carPoints, PointF lineStart, PointF lineEnd, List<PointF> intersectionPoints)
        {
            bool foundIntersection = false;

            // Перевіряємо кожен відрізок машини
            for (int i = 0; i < carPoints.Count - 1; i++)
            {
                PointF p1 = new PointF(carPoints[i].X, carPoints[i].Y);
                PointF p2 = new PointF(carPoints[i + 1].X, carPoints[i + 1].Y);

                bool linesIntersect, segmentsIntersect;
                PointF intersection;

                // Логування перед викликом FindIntersection
                Console.WriteLine($"Перевірка відрізка машини ({p1.X}, {p1.Y}) - ({p2.X}, {p2.Y})...");

                // Викликаємо метод для пошуку перетину
                if (IntersectionHelper.FindIntersection(p1, p2, lineStart, lineEnd, out linesIntersect, out segmentsIntersect, out intersection))
                {
                    if (segmentsIntersect)
                    {
                        foundIntersection = true;
                        intersectionPoints.Add(intersection); // Додаємо знайдену точку перетину
                        Console.WriteLine($"Перетин знайдено у точці ({intersection.X}, {intersection.Y})");
                    }
                    else
                    {
                        Console.WriteLine($"Лінії перетинаються, але відрізки не перетинаються.");
                    }
                }
                else
                {
                    Console.WriteLine($"Лінії не перетинаються.");
                }
            }

            return foundIntersection;
        }
    }

    // Модель для запиту з координатами машин і ліній
    public class IntersectionRequest
    {
        public required List<Point> Car { get; set; }
        // Координати машини
        public int CarNumber { get; set; } // Номер машини
        public required List<Line> Lines { get; set; }
        // Лінії з канвасу
    }


    // Клас для координат точки
    public class Point
    {
        public float X { get; set; } // Координата X
        public float Y { get; set; } // Координата Y
    }

    // Клас для лінії
    public class Line
    {
        public float StartX { get; set; } // Початок лінії на канвасі (X)
        public float StartY { get; set; } // Початок лінії на канвасі (Y)
        public float EndX { get; set; } // Кінець лінії на канвасі (X)
        public float EndY { get; set; } // Кінець лінії на канвасі (Y)
    }

    public static class IntersectionHelper
    {
        // Метод для знаходження точки перетину між двома відрізками
        public static bool FindIntersection(
            PointF p1, PointF p2, PointF p3, PointF p4,
            out bool linesIntersect, out bool segmentsIntersect,
            out PointF intersection)
        {
            float epsilon = 1e-8f; // Толеранс для перевірки майже паралельних ліній

            float dx12 = p2.X - p1.X;
            float dy12 = p2.Y - p1.Y;
            float dx34 = p4.X - p3.X;
            float dy34 = p4.Y - p3.Y;

            float denominator = (dy12 * dx34 - dx12 * dy34);

            if (Math.Abs(denominator) < epsilon)
            {
                // Лінії практично паралельні
                linesIntersect = false;
                segmentsIntersect = false;
                intersection = new PointF(float.NaN, float.NaN);
                return false;
            }

            linesIntersect = true;

            float t1 = ((p1.X - p3.X) * dy34 + (p3.Y - p1.Y) * dx34) / denominator;
            float t2 = ((p3.X - p1.X) * dy12 + (p1.Y - p3.Y) * dx12) / -denominator;

            // Знаходимо точку перетину
            intersection = new PointF(p1.X + dx12 * t1, p1.Y + dy12 * t1);

            // Відрізки перетинаються, якщо t1 та t2 між 0 і 1 (з урахуванням epsilon)
            segmentsIntersect = (t1 >= -epsilon && t1 <= 1 + epsilon &&
                                 t2 >= -epsilon && t2 <= 1 + epsilon);

            return segmentsIntersect;
        }
    }
}
