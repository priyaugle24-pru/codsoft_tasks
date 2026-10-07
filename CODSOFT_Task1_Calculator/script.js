let currentInput = "0";
let firstValue = null;
let operator = null;
let waitingForSecondValue = false;

const display = document.getElementById("display");

function updateDisplay() {
    display.value = currentInput;
}

function appendNumber(number) {
    if (waitingForSecondValue) {
        currentInput = number;
        waitingForSecondValue = false;
    } else if (number === "." && currentInput.includes(".")) {
        return;
    } else if (currentInput === "0" && number !== ".") {
        currentInput = number;
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function chooseOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (operator && waitingForSecondValue) {
        operator = nextOperator;
        return;
    }

    if (firstValue === null) {
        firstValue = inputValue;
    } else if (operator) {
        const result = performCalculation(firstValue, inputValue, operator);
        currentInput = String(result);
        firstValue = result;
        updateDisplay();
    }

    waitingForSecondValue = true;
    operator = nextOperator;
}

function performCalculation(first, second, op) {
    switch (op) {
        case "+": return first + second;
        case "-": return first - second;
        case "*": return first * second;
        case "/":
            return second === 0 ? "Error" : first / second;
        case "%": return first % second;
        default: return second;
    }
}

function calculate() {
    if (operator === null || firstValue === null) return;

    const secondValue = parseFloat(currentInput);
    const result = performCalculation(firstValue, secondValue, operator);

    currentInput = String(result);
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
    updateDisplay();
}

function clearDisplay() {
    currentInput = "0";
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length <= 1 || currentInput === "Error") {
        currentInput = "0";
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
}

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        appendNumber(key);
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
        chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
        calculate();
    } else if (key === "Escape") {
        clearDisplay();
    } else if (key === "Backspace") {
        deleteLast();
    }
});
