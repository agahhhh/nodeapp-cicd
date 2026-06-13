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
// PHYSICS CALCULATOR FUNCTIONALITY - NEW CODE
// ============================================

/**
 * Physics formulas database
 * Contains common physics equations organized by category
 */
const physicsFormulas = {
  mechanics: {
    velocity: {
      name: "Velocity",
      formula: "v = d / t",
      description: "Calculate velocity from distance and time",
      inputs: ["distance (m)", "time (s)"],
      output: "velocity (m/s)",
      calculate: (d, t) => d / t,
    },
    acceleration: {
      name: "Acceleration",
      formula: "a = (v_f - v_i) / t",
      description: "Calculate acceleration from velocity change and time",
      inputs: ["initial velocity (m/s)", "final velocity (m/s)", "time (s)"],
      output: "acceleration (m/s²)",
      calculate: (vi, vf, t) => (vf - vi) / t,
    },
    force: {
      name: "Force (Newton's 2nd Law)",
      formula: "F = m × a",
      description: "Calculate force from mass and acceleration",
      inputs: ["mass (kg)", "acceleration (m/s²)"],
      output: "force (N)",
      calculate: (m, a) => m * a,
    },
    kineticEnergy: {
      name: "Kinetic Energy",
      formula: "KE = ½ × m × v²",
      description: "Calculate kinetic energy from mass and velocity",
      inputs: ["mass (kg)", "velocity (m/s)"],
      output: "kinetic energy (J)",
      calculate: (m, v) => 0.5 * m * v * v,
    },
    potentialEnergy: {
      name: "Gravitational Potential Energy",
      formula: "PE = m × g × h",
      description: "Calculate potential energy from mass, gravity, and height",
      inputs: ["mass (kg)", "height (m)", "gravity (m/s²)"],
      output: "potential energy (J)",
      calculate: (m, h, g = 9.8) => m * g * h,
    },
    momentum: {
      name: "Momentum",
      formula: "p = m × v",
      description: "Calculate momentum from mass and velocity",
      inputs: ["mass (kg)", "velocity (m/s)"],
      output: "momentum (kg·m/s)",
      calculate: (m, v) => m * v,
    },
    work: {
      name: "Work",
      formula: "W = F × d",
      description: "Calculate work from force and displacement",
      inputs: ["force (N)", "displacement (m)"],
      output: "work (J)",
      calculate: (f, d) => f * d,
    },
    power: {
      name: "Power",
      formula: "P = W / t",
      description: "Calculate power from work and time",
      inputs: ["work (J)", "time (s)"],
      output: "power (W)",
      calculate: (w, t) => w / t,
    },
  },
  electricity: {
    ohmsLaw: {
      name: "Ohm's Law (Voltage)",
      formula: "V = I × R",
      description: "Calculate voltage from current and resistance",
      inputs: ["current (A)", "resistance (Ω)"],
      output: "voltage (V)",
      calculate: (i, r) => i * r,
    },
    current: {
      name: "Ohm's Law (Current)",
      formula: "I = V / R",
      description: "Calculate current from voltage and resistance",
      inputs: ["voltage (V)", "resistance (Ω)"],
      output: "current (A)",
      calculate: (v, r) => v / r,
    },
    resistance: {
      name: "Ohm's Law (Resistance)",
      formula: "R = V / I",
      description: "Calculate resistance from voltage and current",
      inputs: ["voltage (V)", "current (A)"],
      output: "resistance (Ω)",
      calculate: (v, i) => v / i,
    },
    electricalPower: {
      name: "Electrical Power",
      formula: "P = V × I",
      description: "Calculate electrical power from voltage and current",
      inputs: ["voltage (V)", "current (A)"],
      output: "power (W)",
      calculate: (v, i) => v * i,
    },
    electricalEnergy: {
      name: "Electrical Energy",
      formula: "E = P × t",
      description: "Calculate electrical energy from power and time",
      inputs: ["power (W)", "time (s)"],
      output: "energy (J)",
      calculate: (p, t) => p * t,
    },
  },
  thermodynamics: {
    heatTransfer: {
      name: "Heat Transfer",
      formula: "Q = m × c × ΔT",
      description:
        "Calculate heat transfer from mass, specific heat, and temperature change",
      inputs: ["mass (kg)", "specific heat (J/kg·K)", "temperature change (K)"],
      output: "heat (J)",
      calculate: (m, c, dt) => m * c * dt,
    },
    efficiency: {
      name: "Efficiency",
      formula: "η = (useful output / total input) × 100",
      description: "Calculate efficiency percentage",
      inputs: ["useful output", "total input"],
      output: "efficiency (%)",
      calculate: (output, input) => (output / input) * 100,
    },
  },
  waves: {
    waveSpeed: {
      name: "Wave Speed",
      formula: "v = f × λ",
      description: "Calculate wave speed from frequency and wavelength",
      inputs: ["frequency (Hz)", "wavelength (m)"],
      output: "wave speed (m/s)",
      calculate: (f, lambda) => f * lambda,
    },
    frequency: {
      name: "Frequency",
      formula: "f = 1 / T",
      description: "Calculate frequency from period",
      inputs: ["period (s)"],
      output: "frequency (Hz)",
      calculate: (t) => 1 / t,
    },
  },
};

/**
 * Calculate physics formula based on selected category and formula
 */
function calculatePhysics() {
  const category = document.getElementById("physics-category").value;
  const formulaKey = document.getElementById("physics-formula").value;
  const resultDiv = document.getElementById("physics-result");

  if (!category || !formulaKey) {
    resultDiv.innerHTML =
      '<div class="alert alert-warning py-2 px-3">Please select both category and formula</div>';
    return;
  }

  const formula = physicsFormulas[category][formulaKey];
  const inputs = [];

  // Get all input values
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`physics-input-${i}`);
    if (input && input.style.display !== "none") {
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        resultDiv.innerHTML =
          '<div class="alert alert-danger py-2 px-3">Please enter valid numbers for all inputs</div>';
        return;
      }
      inputs.push(value);
    }
  }

  try {
    const result = formula.calculate(...inputs);

    if (isNaN(result) || !isFinite(result)) {
      resultDiv.innerHTML =
        '<div class="alert alert-danger py-2 px-3">Error in calculation. Please check your inputs.</div>';
      return;
    }

    // Display result with formula
    let resultHTML = '<div class="alert alert-success py-2 px-3">';
    resultHTML += `<strong>${formula.name}</strong><br>`;
    resultHTML += `Formula: ${formula.formula}<br>`;
    resultHTML += `Result: <strong>${result.toFixed(4)} ${formula.output.match(/\(([^)]+)\)/)?.[1] || ""}</strong>`;
    resultHTML += "</div>";

    resultDiv.innerHTML = resultHTML;
  } catch (error) {
    resultDiv.innerHTML =
      '<div class="alert alert-danger py-2 px-3">Error in calculation: ' +
      error.message +
      "</div>";
  }
}

/**
 * Update formula dropdown when category changes
 */
function updatePhysicsFormulas() {
  const category = document.getElementById("physics-category").value;
  const formulaSelect = document.getElementById("physics-formula");
  const inputsContainer = document.getElementById("physics-inputs-container");
  const resultDiv = document.getElementById("physics-result");

  // Clear previous selections
  formulaSelect.innerHTML = '<option value="">-- Select Formula --</option>';
  inputsContainer.innerHTML = "";
  resultDiv.innerHTML = "";

  if (!category) return;

  // Populate formulas for selected category
  const formulas = physicsFormulas[category];
  for (const [key, formula] of Object.entries(formulas)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = formula.name;
    formulaSelect.appendChild(option);
  }
}

/**
 * Update input fields when formula changes
 */
function updatePhysicsInputs() {
  const category = document.getElementById("physics-category").value;
  const formulaKey = document.getElementById("physics-formula").value;
  const inputsContainer = document.getElementById("physics-inputs-container");
  const resultDiv = document.getElementById("physics-result");

  // Clear previous inputs and results
  inputsContainer.innerHTML = "";
  resultDiv.innerHTML = "";

  if (!category || !formulaKey) return;

  const formula = physicsFormulas[category][formulaKey];

  // Display formula description
  let inputsHTML = `<div class="alert alert-info py-2 px-3 mb-2"><small>${formula.description}</small></div>`;

  // Create input fields
  formula.inputs.forEach((inputLabel, index) => {
    inputsHTML += `
      <div class="mb-2">
        <label class="form-label small">${inputLabel}</label>
        <input type="number" class="form-control form-control-sm" id="physics-input-${index + 1}" 
               placeholder="Enter ${inputLabel}" step="any">
      </div>
    `;
  });

  inputsContainer.innerHTML = inputsHTML;
}

/**
 * Clear all physics calculator inputs and results
 */
function clearPhysicsCalculator() {
  document.getElementById("physics-category").value = "";
  document.getElementById("physics-formula").innerHTML =
    '<option value="">-- Select Formula --</option>';
  document.getElementById("physics-inputs-container").innerHTML = "";
  document.getElementById("physics-result").innerHTML = "";
}

// ============================================
// END OF PHYSICS CALCULATOR FUNCTIONALITY
// ============================================

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