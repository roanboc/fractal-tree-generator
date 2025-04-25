const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

export function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawFractalTree(x, y, length, angle, depth, branchLengthFactor, branchAngle, lineWidth, color) {
    if (depth === 0) return;

    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.moveTo(x, y);
    const newX = x + length * Math.cos(angle);
    const newY = y - length * Math.sin(angle);
    ctx.lineTo(newX, newY);
    ctx.stroke();

    drawFractalTree(newX, newY, length * branchLengthFactor, angle - branchAngle, depth - 1, branchLengthFactor, branchAngle, lineWidth * 0.7, color);
    drawFractalTree(newX, newY, length * branchLengthFactor, angle + branchAngle, depth - 1, branchLengthFactor, branchAngle, lineWidth * 0.7, color);
}