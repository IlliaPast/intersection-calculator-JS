let xTranslateCar1 = 0, yTranslateCar1 = 0, rotationAngleCar1 = 0;
let xTranslateCar2 = 0, yTranslateCar2 = 0, rotationAngleCar2 = 0; // Зміщуємо другу машину вправо
let carCoordinates = [];  // Масив для збереження координат після першого зчитування
let modifiedCarCoordinatesCar1 = [];
let modifiedCarCoordinatesCar2 = [];
let drawnLines = []; // Масив для збереження ліній

document.getElementById('readFileButton').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Будь ласка, виберіть файл.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const content = event.target.result;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);

        if (lines.length > 0 && lines[0].toLowerCase().includes('x') && lines[0].toLowerCase().includes('y')) {
            lines.shift(); // Видаляємо заголовок, якщо є
        }

        if (lines.length === 0) {
            alert("Файл порожній або неправильно відформатований.");
            return;
        }

        // Зберігаємо координати після першого зчитування файлу
        carCoordinates = lines.map(line => {
            const [x, y] = line.split('\t').map(parseFloat);
            return { x, y };
        });

        updateModifiedCarCoordinates(); // Оновлюємо модифіковані координати для обох машин
        drawCars(); // Малюємо машини
    };

    reader.readAsText(file);
});

// Функція для оновлення змінних модифікованих координат машин
function updateModifiedCarCoordinates() {
    modifiedCarCoordinatesCar1 = calculateModifiedCoordinates(xTranslateCar1, yTranslateCar1, rotationAngleCar1);
    modifiedCarCoordinatesCar2 = calculateModifiedCoordinates(xTranslateCar2, yTranslateCar2, rotationAngleCar2);
}

// Функція для обчислення нових координат з урахуванням трансляції та повороту
function calculateModifiedCoordinates(translateX, translateY, angle) {
    const modifiedCoordinates = [];
    const angleRad = angle * Math.PI / 180;

    carCoordinates.forEach(({ x, y }) => {
        if (!isNaN(x) && !isNaN(y)) {
            // Обчислення нових координат з урахуванням трансляції та повороту
            const newX = x * Math.cos(angleRad) - y * Math.sin(angleRad) + translateX;
            const newY = x * Math.sin(angleRad) + y * Math.cos(angleRad) + translateY;
            modifiedCoordinates.push({ x: newX, y: newY });
        }
    });

    return modifiedCoordinates;
}

// Функція для малювання машин
function drawCars() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищуємо перед малюванням

    // Зберігаємо контекст
    ctx.save();

    // Інвертуємо координати по осі Y для перевороту малювання
    ctx.translate(0, canvas.height); // Переміщаємося внизу canvas
    ctx.scale(1, -1); // Масштабуємо по осі Y на -1 для перевороту

    function drawCarWithCoordinates(color, coordinates) {
        // Малювання точок
        coordinates.forEach(({ x, y }) => {
            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) { // Перевірка, чи координати в межах canvas
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Малюємо першу машину
    drawCarWithCoordinates('red', modifiedCarCoordinatesCar1);

    // Малюємо другу машину
    drawCarWithCoordinates('blue', modifiedCarCoordinatesCar2);

    // Малюємо всі збережені лінії
    drawnLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();
    });

    // Відновлюємо контекст
    ctx.restore();
}


document.getElementById('clearCanvas').addEventListener('click', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnLines = []; // Очищуємо масив ліній
    drawCars(); // Перемальовуємо машини після очищення
});

// Оновлення координат та повороту першої машини
document.getElementById('applyCar1').addEventListener('click', function () {
    xTranslateCar1 = parseFloat(document.getElementById('xTranslateCar1').value);
    yTranslateCar1 = parseFloat(document.getElementById('yTranslateCar1').value);
    rotationAngleCar1 = parseFloat(document.getElementById('rotationAngleCar1').value);
    updateModifiedCarCoordinates();
    drawCars();
});

// Оновлення координат та повороту другої машини
document.getElementById('applyCar2').addEventListener('click', function () {
    xTranslateCar2 = parseFloat(document.getElementById('xTranslateCar2').value);
    yTranslateCar2 = parseFloat(document.getElementById('yTranslateCar2').value);
    rotationAngleCar2 = parseFloat(document.getElementById('rotationAngleCar2').value);
    updateModifiedCarCoordinates();
    drawCars();
});

// Функція для малювання лінії між точками і збереження в масив
document.getElementById('drawLine').addEventListener('click', function () {
    const startX = parseFloat(document.getElementById('startX').value);
    const startY = parseFloat(document.getElementById('startY').value);
    const endX = parseFloat(document.getElementById('endX').value);
    const endY = parseFloat(document.getElementById('endY').value);

    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Використання функції getLinePoints для обчислення точок лінії
    const linePoints = getLinePoints(startX, startY, endX, endY);

    // Збереження лінії в масив
    drawnLines.push({
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        points: linePoints
    });
});

// Функція для отримання точок лінії
function getLinePoints(x1, y1, x2, y2) {
    const points = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= steps; i++) {
        points.push({ x: Math.round(x), y: Math.round(y) });
        x += xIncrement;
        y += yIncrement;
    }

    return points;
}

// Функція для перевірки, чи перетинаються дві машини або лінія з машиною
function findMatchingPairsWithAllComparisons(array1, array2) {
    let count = 0;
    const tolerance = 0.5;

    array1.forEach((pair1) => {
        array2.forEach((pair2) => {
            if (
                Math.abs(pair1.x - pair2.x) <= tolerance &&
                Math.abs(pair1.y - pair2.y) <= tolerance
            ) {
                count++;
            }
        });
    });

    return count;
}

// Функція для відображення результатів на сторінці
function displayIntersections(carNumber, lineIntersections, carIntersections, timeTaken) {
    let outputElement = document.getElementById('intersectionOutput');
    if (!outputElement) {
        outputElement = document.createElement('div');
        outputElement.id = 'intersectionOutput';
        document.body.appendChild(outputElement);
    }
    const result = `Знайдено ${lineIntersections} перетинів з лініями і ${carIntersections} перетинів з іншою машиною для машини ${carNumber} за ${timeTaken.toFixed(2)} мс.`;
    const paragraph = document.createElement('p');
    paragraph.textContent = result;
    outputElement.appendChild(paragraph);
}

// Показати перетини для машини 1
document.getElementById('showIntersectionsCar1').addEventListener('click', function () {
    const startTime = performance.now();
    const lineIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar1, drawnLines.flatMap(line => line.points));
    const carIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar1, modifiedCarCoordinatesCar2);
    const endTime = performance.now();
    displayIntersections(1, lineIntersections, carIntersections, endTime - startTime);
});

// Показати перетини для машини 2
document.getElementById('showIntersectionsCar2').addEventListener('click', function () {
    const startTime = performance.now();
    const lineIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar2, drawnLines.flatMap(line => line.points));
    const carIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar2, modifiedCarCoordinatesCar1);
    const endTime = performance.now();
    displayIntersections(2, lineIntersections, carIntersections, endTime - startTime);
});
