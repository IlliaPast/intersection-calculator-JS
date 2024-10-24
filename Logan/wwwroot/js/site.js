let xTranslateCar1 = 0, yTranslateCar1 = 0, rotationAngleCar1 = 0;
let xTranslateCar2 = 0, yTranslateCar2 = 0, rotationAngleCar2 = 0;
let carCoordinates = [];
let modifiedCarCoordinatesCar1 = [];
let modifiedCarCoordinatesCar2 = [];
let drawnLines = [];

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
            lines.shift();
        }

        if (lines.length === 0) {
            alert("Файл порожній або неправильно відформатований.");
            return;
        }

        carCoordinates = lines.map(line => {
            const [x, y] = line.split('\t').map(parseFloat);
            return { x, y };
        });

        updateModifiedCarCoordinates();
        drawCars();
    };

    reader.readAsText(file);
});

function updateModifiedCarCoordinates() {
    modifiedCarCoordinatesCar1 = calculateModifiedCoordinates(xTranslateCar1, yTranslateCar1, rotationAngleCar1);
    modifiedCarCoordinatesCar2 = calculateModifiedCoordinates(xTranslateCar2, yTranslateCar2, rotationAngleCar2);
}

function calculateModifiedCoordinates(translateX, translateY, angle) {
    const modifiedCoordinates = [];
    const angleRad = angle * Math.PI / 180;

    carCoordinates.forEach(({ x, y }) => {
        if (!isNaN(x) && !isNaN(y)) {
            const canvas = document.getElementById('myCanvas');
            const mirroredY = canvas.height - y;

            const centerX = carCoordinates.reduce((sum, coord) => sum + coord.x, 0) / carCoordinates.length;
            const centerY = carCoordinates.reduce((sum, coord) => sum + coord.y, 0) / carCoordinates.length;
            const mirroredCenterY = canvas.height - centerY;

            const translatedX = x - centerX;
            const translatedY = mirroredY - mirroredCenterY;
            const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
            const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
            const newX = rotatedX + centerX + translateX;
            const newY = rotatedY + mirroredCenterY + translateY;
            modifiedCoordinates.push({ x: newX, y: newY });
        }
    });

    return modifiedCoordinates;
}

function drawCars() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    function drawCarWithCoordinates(color, coordinates) {
        coordinates.forEach(({ x, y }) => {
            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    drawCarWithCoordinates('red', modifiedCarCoordinatesCar1);
    drawCarWithCoordinates('blue', modifiedCarCoordinatesCar2);

    drawnLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();
    });
}

document.getElementById('clearCanvas').addEventListener('click', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnLines = [];
    drawCars();
});

document.getElementById('applyCar1').addEventListener('click', function () {
    xTranslateCar1 = parseFloat(document.getElementById('xTranslateCar1').value);
    yTranslateCar1 = parseFloat(document.getElementById('yTranslateCar1').value);
    rotationAngleCar1 = parseFloat(document.getElementById('rotationAngleCar1').value);
    updateModifiedCarCoordinates();
    drawCars();
});

document.getElementById('applyCar2').addEventListener('click', function () {
    xTranslateCar2 = parseFloat(document.getElementById('xTranslateCar2').value);
    yTranslateCar2 = parseFloat(document.getElementById('yTranslateCar2').value);
    rotationAngleCar2 = parseFloat(document.getElementById('rotationAngleCar2').value);
    updateModifiedCarCoordinates();
    drawCars();
});

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

    const linePoints = getLinePoints(startX, startY, endX, endY);

    drawnLines.push({
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        points: linePoints
    });
});

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

function findMatchingPairsWithAllComparisons(array1, array2) {
    let count = 0;
    const tolerance = 0.5;
    const intersections = [];

    array1.forEach((pair1) => {
        array2.forEach((pair2) => {
            if (Math.abs(pair1.x - pair2.x) <= tolerance &&
                Math.abs(pair1.y - pair2.y) <= tolerance) {
                count++;
                intersections.push(pair1);
            }
        });
    });

    return intersections;
}

function displayIntersections(carNumber, lineIntersections, carIntersections, timeTaken) {
    let outputElement = document.getElementById('intersectionOutput');
    if (!outputElement) {
        outputElement = document.createElement('div');
        outputElement.id = 'intersectionOutput';
        document.body.appendChild(outputElement);
    }
    const result = `Знайдено ${lineIntersections.length} перетинів з лініями і ${carIntersections.length} перетинів з іншою машиною для машини ${carNumber} за ${timeTaken.toFixed(2)} мс.`;
    const paragraph = document.createElement('p');
    paragraph.textContent = result;
    outputElement.appendChild(paragraph);
}

function drawIntersections(intersections) {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    intersections.forEach(({ x, y }) => {
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            ctx.fillStyle = 'green';
            ctx.fillRect(x - 2, y - 2, 4, 4); // Малюємо квадрат розміром 4х4 для позначення перетину
        }
    });
}

document.getElementById('showIntersectionsCar1').addEventListener('click', function () {
    const startTime = performance.now();
    const lineIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar1, drawnLines.flatMap(line => line.points));
    const carIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar1, modifiedCarCoordinatesCar2);
    const endTime = performance.now();

    displayIntersections(1, lineIntersections, carIntersections, endTime - startTime);

    // Малюємо квадратики для перетинів з лініями та з іншою машиною
    drawIntersections([...lineIntersections, ...carIntersections]);
});

document.getElementById('showIntersectionsCar2').addEventListener('click', function () {
    const startTime = performance.now();
    const lineIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar2, drawnLines.flatMap(line => line.points));
    const carIntersections = findMatchingPairsWithAllComparisons(modifiedCarCoordinatesCar2, modifiedCarCoordinatesCar1);
    const endTime = performance.now();

    displayIntersections(2, lineIntersections, carIntersections, endTime - startTime);

    // Малюємо квадратики для перетинів з лініями та з іншою машиною
    drawIntersections([...lineIntersections, ...carIntersections]);
});
let isFlippedCar1 = false;
let isFlippedCar2 = false;
function flipCar(modifiedCoordinates) {
    const centerX = modifiedCoordinates.reduce((sum, coord) => sum + coord.x, 0) / modifiedCoordinates.length;
    return modifiedCoordinates.map(({ x, y }) => {
        return { x: centerX * 2 - x, y }; // Дзеркально відображаємо по осі X відносно центру
    });
}
document.getElementById('reversCar1Buttom').addEventListener('click', function () {
    isFlippedCar1 = !isFlippedCar1;
    if (isFlippedCar1) {
        modifiedCarCoordinatesCar1 = flipCar(modifiedCarCoordinatesCar1);
        rotationAngleCar1 = -rotationAngleCar1; // Зберігаємо кут, але робимо його протилежним
    } else {
        modifiedCarCoordinatesCar1 = calculateModifiedCoordinates(xTranslateCar1, yTranslateCar1, rotationAngleCar1);
    }
    drawCars();
});
document.getElementById('reversCar2Buttom').addEventListener('click', function () {
    isFlippedCar2 = !isFlippedCar2;
    if (isFlippedCar2) {
        modifiedCarCoordinatesCar2 = flipCar(modifiedCarCoordinatesCar2);
        rotationAngleCar2 = -rotationAngleCar2; // Зберігаємо кут, але робимо його протилежним
    } else {
        modifiedCarCoordinatesCar2 = calculateModifiedCoordinates(xTranslateCar2, yTranslateCar2, rotationAngleCar2);
    }
    drawCars();
});