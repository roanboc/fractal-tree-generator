export function getSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    return slider ? parseFloat(slider.value) : null;
}

export function updateDisplayValue(displayId, value) {
    const display = document.getElementById(displayId);
    if (display) {
        display.textContent = value;
    }
}

export function attachEventListeners(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', callback);
    }
}

export function attachSliderChangeListener(sliderId, callback) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        slider.addEventListener('input', () => {
            callback(getSliderValue(sliderId));
        });
    }
}

export function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}