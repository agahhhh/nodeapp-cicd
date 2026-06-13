// ===============================
// 🧠 SMART RESULT MEMORY FEATURE
// ===============================

let LAST_RESULT = 0;
var currentExpression = "";

// ------------------------------
// Theme Toggle Logic
// ------------------------------
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    btn.innerHTML = "☀️";
    btn.title = "Switch to light mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerHTML = "🌙";
    btn.title = "Switch to dark mode";
    localStorage.setItem("theme", "light");
  }
}

// Set theme on page load from localStorage
window.addEventListener("DOMContentLoaded", function () {
  const theme = localStorage.getItem("theme");
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  if (btn) {
    if (theme === "dark") {
      body.classList.add("dark-mode");
      btn.innerHTML = "☀️";
      btn.title = "Switch to light mode";
    } else {
      btn.innerHTML = "🌙";
      btn.title = "Switch to dark mode";
    }
  }
});

// ------------------------------
// Calculator State
// ------------------------------
let left = "";
let operator = "";
let right = "";
let steps = [];
const MAX_STEPS = 6;

// ------------------------------
// Basic Calculator Functions
// ------------------------------
function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

function bracketToResult(value) {
  currentExpression += value;
  updateResult();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  if (value === "^") {
    currentExpression += "**";
  } else {
    currentExpression += value;
  }
  updateResult();
}

function clearResult() {
  currentExpression = "";
  updateResult();
}


function normalizeExpression(expr) {
  return expr
    .replace(/asin\(/g, "asinDeg(")
    .replace(/acos\(/g, "acosDeg(")
    .replace(/atan\(/g, "atanDeg(")
    .replace(/sin\(/g, "sinDeg(")
    .replace(/cos\(/g, "cosDeg(")
    .replace(/tan\(/g, "tanDeg(")
    .replace(/asinh\(/g, "asinh(")
    .replace(/sinh\(/g, "sinh(")
    .replace(/\be\b/g, "Math.E")
    .replace(/\bpi\b/g, "Math.PI");
}

function percentToResult() {
  if (!currentExpression) return;

  const match = currentExpression.match(/(.+?)(\*\*|[+\-*/^])([0-9.]*)$/);

  if (!match) {
    const num = parseFloat(currentExpression);
    if (isNaN(num)) return;

    currentExpression = (num / 100).toString();
  } else {
    const leftPart = match[1];
    const rightPart = match[3];

    if (!rightPart) return;

    let leftVal;

    try {
      leftVal = eval(leftPart);
    } catch (e) {
      leftVal = parseFloat(leftPart);
    }

    const rightVal = parseFloat(rightPart);
    if (isNaN(leftVal) || isNaN(rightVal)) return;

    const percentVal = (leftVal * rightVal) / 100;

    currentExpression = percentVal.toString();
  }

  // 🔥 ADD THIS LINE
  currentExpression += "*";

  updateResult();
}

// ------------------------------
// Power Functions
// ------------------------------
function squareResult() {
  if (!currentExpression) return;
  // Wrap in parens so e.g. 2+3 x² → (2+3)**2 = 25, not 2+3**2 = 11
  currentExpression = "(" + currentExpression + ")**2";
  updateResult();
}

// ============================================
// PERCENTAGE CHANGE CALCULATOR FUNCTIONS
// ============================================
function calculatePercentageChange() {
  // Get input values
  const original = parseFloat(document.getElementById("pc-original").value);
  const newValue = parseFloat(document.getElementById("pc-new").value);

  // Validation
  if (isNaN(original) || isNaN(newValue)) {
    alert("Please enter valid numbers");
    return;
  }

  if (original === 0) {
    alert("Original value cannot be zero");
    return;
  }

  // Calculate percentage change
  const absoluteChange = newValue - original;
  const percentageChange = (absoluteChange / Math.abs(original)) * 100;

  // Determine description
  let description = "";
  if (percentageChange > 0) {
    description = `an increase of ${Math.abs(percentageChange).toFixed(2)}%`;
  } else if (percentageChange < 0) {
    description = `a decrease of ${Math.abs(percentageChange).toFixed(2)}%`;
  } else {
    description = "no change";
  }

  // Display results
  const resultDiv = document.getElementById("pc-result");
  document.getElementById("pc-change-value").textContent =
    percentageChange.toFixed(2);
  document.getElementById("pc-absolute-change").textContent =
    Math.abs(absoluteChange).toFixed(2);
  document.getElementById("pc-description").textContent =
    `From ${original} to ${newValue} is ${description}`;
  resultDiv.style.display = "block";

  // Update main calculator display with the result
  left = percentageChange.toFixed(2).toString();
  operator = "";
  right = "";
  updateResult();
}

function clearPercentageChange() {
  // Clear input fields
  document.getElementById("pc-original").value = "100";
  document.getElementById("pc-new").value = "150";

  // Hide result
  document.getElementById("pc-result").style.display = "none";

  // Clear calculator display
  left = "";
  operator = "";
  right = "";
  updateResult();
}


// ------------------------------
// Calculate Result
// ------------------------------
function calculateResult() {
  if (!currentExpression) return;

  try {
   
    const display = document.getElementById("result");
    let normalizedExpression = normalizeExpression(currentExpression);

    // 🧠 Replace "ans" with last result automatically
    normalizedExpression = normalizedExpression.replace(
      /\bans\b/gi,
      LAST_RESULT,
    );

    // Calculate result
    let result = eval(normalizedExpression);
    console.log("Calculated result for expression:", currentExpression, "->", result);
    // Save result for future expressions
    LAST_RESULT = result;

    // Display normally
    display.value = result;

    if (isNaN(result) || !isFinite(result)) {
      throw new Error();
    }

    currentExpression = result.toString();
    updateResult();
  } catch (e) {
    currentExpression = "Error";
    updateResult();
  }
}


function updateResult() {
  document.getElementById("result").value = currentExpression || "0";
}