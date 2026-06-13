/**
 * @jest-environment jsdom
 *
 * calculator.test.js
 * Tests for assets/js/script.js — covers every calculator function
 * including the new squareResult() power feature.
 *
 * Run with:  npm test
 */

const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// One-time setup: mount the minimal DOM, then load the script into the
// global (window) scope using an indirect eval so that all var/function
// declarations land on window and are accessible throughout the tests.
// ---------------------------------------------------------------------------
beforeAll(() => {
  document.body.innerHTML = `
    <input type="text" id="result" value="0" />
    <button id="theme-toggle">🌙</button>
  `;

  const scriptPath = path.resolve(__dirname, "../assets/js/script.js");
  const code = fs.readFileSync(scriptPath, "utf8");

  // window.eval() is an indirect eval → var & function declarations
  // become properties of the global object (window === global in jsdom).
  window.eval(code);
});

// ---------------------------------------------------------------------------
// Reset mutable state before every test so tests don't bleed into each other.
// currentExpression is a var → lives on window.
// LAST_RESULT is a let → only reachable through the shared eval closure, so
// we reset it indirectly by running a trivial "0" calculation first.
// ---------------------------------------------------------------------------
beforeEach(() => {
  window.currentExpression = "0";
  window.calculateResult();          // sets LAST_RESULT = 0 inside the closure
  window.currentExpression = "";
  document.getElementById("result").value = "0";
});

// ===========================================================================
// normalizeExpression()
// Pure transformation — no DOM or state side effects.
// ===========================================================================
describe("normalizeExpression()", () => {
  test("replaces sin( with sinDeg(", () => {
    expect(window.normalizeExpression("sin(90)")).toBe("sinDeg(90)");
  });

  test("replaces cos( with cosDeg(", () => {
    expect(window.normalizeExpression("cos(0)")).toBe("cosDeg(0)");
  });

  test("replaces tan( with tanDeg(", () => {
    expect(window.normalizeExpression("tan(45)")).toBe("tanDeg(45)");
  });

  test("replaces asin( with asinDeg(", () => {
    expect(window.normalizeExpression("asin(1)")).toBe("asinDeg(1)");
  });

  test("replaces acos( with acosDeg(", () => {
    expect(window.normalizeExpression("acos(0)")).toBe("acosDeg(0)");
  });

  test("replaces atan( with atanDeg(", () => {
    expect(window.normalizeExpression("atan(1)")).toBe("atanDeg(1)");
  });

  test("does NOT turn sinh( into sinhDeg( — sinh is preserved", () => {
    expect(window.normalizeExpression("sinh(1)")).toBe("sinh(1)");
  });

  test("does NOT turn asinh( into asinhDeg( — asinh is preserved", () => {
    expect(window.normalizeExpression("asinh(1)")).toBe("asinh(1)");
  });

  test("replaces standalone e with Math.E", () => {
    expect(window.normalizeExpression("e")).toBe("Math.E");
  });

  test("replaces pi with Math.PI", () => {
    expect(window.normalizeExpression("pi")).toBe("Math.PI");
  });

  test("leaves plain arithmetic unchanged", () => {
    expect(window.normalizeExpression("2+3*4")).toBe("2+3*4");
  });

  test("handles multiple replacements in one expression", () => {
    const result = window.normalizeExpression("sin(pi)+cos(pi)");
    expect(result).toBe("sinDeg(Math.PI)+cosDeg(Math.PI)");
  });
});

// ===========================================================================
// appendToResult()
// ===========================================================================
describe("appendToResult()", () => {
  test("appends a single digit to an empty expression", () => {
    window.appendToResult(5);
    expect(window.currentExpression).toBe("5");
  });

  test("appends multiple digits sequentially", () => {
    window.appendToResult(1);
    window.appendToResult(2);
    window.appendToResult(3);
    expect(window.currentExpression).toBe("123");
  });

  test("appends a decimal point", () => {
    window.appendToResult(3);
    window.appendToResult(".");
    window.appendToResult(1);
    expect(window.currentExpression).toBe("3.1");
  });

  test("updates the display input element", () => {
    window.appendToResult(9);
    expect(document.getElementById("result").value).toBe("9");
  });

  test("converts numeric argument to string before appending", () => {
    window.appendToResult(0);
    expect(window.currentExpression).toBe("0");
  });
});

// ===========================================================================
// bracketToResult()
// ===========================================================================
describe("bracketToResult()", () => {
  test("appends an opening bracket", () => {
    window.bracketToResult("(");
    expect(window.currentExpression).toBe("(");
  });

  test("appends a closing bracket", () => {
    window.bracketToResult("(");
    window.appendToResult(4);
    window.bracketToResult(")");
    expect(window.currentExpression).toBe("(4)");
  });

  test("updates the display", () => {
    window.bracketToResult("(");
    expect(document.getElementById("result").value).toBe("(");
  });
});

// ===========================================================================
// backspace()
// ===========================================================================
describe("backspace()", () => {
  test("removes the last character", () => {
    window.currentExpression = "123";
    window.backspace();
    expect(window.currentExpression).toBe("12");
  });

  test("removes a trailing operator", () => {
    window.currentExpression = "5+";
    window.backspace();
    expect(window.currentExpression).toBe("5");
  });

  test("on an empty expression, stays empty", () => {
    window.backspace();
    expect(window.currentExpression).toBe("");
  });

  test("on a single character, clears to empty string", () => {
    window.currentExpression = "7";
    window.backspace();
    expect(window.currentExpression).toBe("");
  });

  test("updates the display after deletion", () => {
    window.currentExpression = "42";
    window.backspace();
    expect(document.getElementById("result").value).toBe("4");
  });
});

// ===========================================================================
// operatorToResult()
// ===========================================================================
describe("operatorToResult()", () => {
  test("appends + operator", () => {
    window.currentExpression = "5";
    window.operatorToResult("+");
    expect(window.currentExpression).toBe("5+");
  });

  test("appends - operator", () => {
    window.currentExpression = "5";
    window.operatorToResult("-");
    expect(window.currentExpression).toBe("5-");
  });

  test("appends * operator", () => {
    window.currentExpression = "5";
    window.operatorToResult("*");
    expect(window.currentExpression).toBe("5*");
  });

  test("appends / operator", () => {
    window.currentExpression = "5";
    window.operatorToResult("/");
    expect(window.currentExpression).toBe("5/");
  });

  test("converts ^ to ** (power)", () => {
    window.currentExpression = "2";
    window.operatorToResult("^");
    expect(window.currentExpression).toBe("2**");
  });

  test("updates the display", () => {
    window.currentExpression = "3";
    window.operatorToResult("+");
    expect(document.getElementById("result").value).toBe("3+");
  });
});

// ===========================================================================
// clearResult()
// ===========================================================================
describe("clearResult()", () => {
  test("sets currentExpression to empty string", () => {
    window.currentExpression = "123+456";
    window.clearResult();
    expect(window.currentExpression).toBe("");
  });

  test("updates the display to 0 (falsy expression shows placeholder)", () => {
    window.currentExpression = "999";
    window.clearResult();
    expect(document.getElementById("result").value).toBe("0");
  });

  test("works when expression is already empty", () => {
    window.clearResult();
    expect(window.currentExpression).toBe("");
  });
});

// ===========================================================================
// percentToResult()
// ===========================================================================
describe("percentToResult()", () => {
  test("converts a standalone number to its decimal form and appends *", () => {
    window.currentExpression = "50";
    window.percentToResult();
    expect(window.currentExpression).toBe("0.5*");
  });

  test("converts 100 to 1", () => {
    window.currentExpression = "100";
    window.percentToResult();
    expect(window.currentExpression).toBe("1*");
  });

  test("converts 1 to 0.01", () => {
    window.currentExpression = "1";
    window.percentToResult();
    expect(window.currentExpression).toBe("0.01*");
  });

  test("calculates percentage of left-hand value (e.g. 200*25 → 50*)", () => {
    window.currentExpression = "200*25";
    window.percentToResult();
    expect(window.currentExpression).toBe("50*");
  });

  test("calculates percentage with addition context (400+50 → 200*)", () => {
    // leftVal=400, rightVal=50 → 400*50/100 = 200
    window.currentExpression = "400+50";
    window.percentToResult();
    expect(window.currentExpression).toBe("200*");
  });

  test("does nothing when expression is empty", () => {
    window.percentToResult();
    expect(window.currentExpression).toBe("");
  });

  test("does nothing when operator has no right operand yet", () => {
    window.currentExpression = "5+";
    window.percentToResult();
    // rightPart is "" → early return, no change
    expect(window.currentExpression).toBe("5+");
  });
});

// ===========================================================================
// calculateResult()
// ===========================================================================
describe("calculateResult()", () => {
  test("does nothing on empty expression", () => {
    window.calculateResult();
    expect(window.currentExpression).toBe("");
  });

  test("evaluates simple addition", () => {
    window.currentExpression = "2+3";
    window.calculateResult();
    expect(window.currentExpression).toBe("5");
  });

  test("evaluates subtraction", () => {
    window.currentExpression = "10-4";
    window.calculateResult();
    expect(window.currentExpression).toBe("6");
  });

  test("evaluates multiplication", () => {
    window.currentExpression = "6*7";
    window.calculateResult();
    expect(window.currentExpression).toBe("42");
  });

  test("evaluates division", () => {
    window.currentExpression = "15/3";
    window.calculateResult();
    expect(window.currentExpression).toBe("5");
  });

  test("evaluates power expression (2**8 = 256)", () => {
    window.currentExpression = "2**8";
    window.calculateResult();
    expect(window.currentExpression).toBe("256");
  });

  test("handles decimal results (1/4 = 0.25)", () => {
    window.currentExpression = "1/4";
    window.calculateResult();
    expect(window.currentExpression).toBe("0.25");
  });

  test("uses ans to recall last result", () => {
    window.currentExpression = "10";
    window.calculateResult();                // LAST_RESULT = 10
    window.currentExpression = "ans+5";
    window.calculateResult();                // 10 + 5 = 15
    expect(window.currentExpression).toBe("15");
  });

  test("ans is case-insensitive (ANS works too)", () => {
    window.currentExpression = "7";
    window.calculateResult();                // LAST_RESULT = 7
    window.currentExpression = "ANS*2";
    window.calculateResult();               // 7 * 2 = 14
    expect(window.currentExpression).toBe("14");
  });

  test("sets currentExpression to Error for an invalid expression", () => {
    window.currentExpression = "5+*3";
    window.calculateResult();
    expect(window.currentExpression).toBe("Error");
  });

  test("sets currentExpression to Error for division by zero", () => {
    window.currentExpression = "1/0";
    window.calculateResult();
    expect(window.currentExpression).toBe("Error");
  });

  test("updates the display with the numeric result", () => {
    window.currentExpression = "9*9";
    window.calculateResult();
    expect(document.getElementById("result").value).toBe("81");
  });

  test("handles parentheses correctly", () => {
    window.currentExpression = "(2+3)*4";
    window.calculateResult();
    expect(window.currentExpression).toBe("20");
  });
});

// ===========================================================================
// squareResult()  ← new feature
// ===========================================================================
describe("squareResult()", () => {
  test("does nothing on empty expression", () => {
    window.squareResult();
    expect(window.currentExpression).toBe("");
  });

  test("wraps expression in parens and appends **2", () => {
    window.currentExpression = "5";
    window.squareResult();
    expect(window.currentExpression).toBe("(5)**2");
  });

  test("5² evaluates to 25", () => {
    window.currentExpression = "5";
    window.squareResult();
    window.calculateResult();
    expect(window.currentExpression).toBe("25");
  });

  test("12² evaluates to 144", () => {
    window.currentExpression = "12";
    window.squareResult();
    window.calculateResult();
    expect(window.currentExpression).toBe("144");
  });

  test("wraps a compound expression correctly (2+3 → (2+3)**2)", () => {
    window.currentExpression = "2+3";
    window.squareResult();
    expect(window.currentExpression).toBe("(2+3)**2");
  });

  test("(2+3)² evaluates to 25, not 11 (confirms parens wrap)", () => {
    window.currentExpression = "2+3";
    window.squareResult();
    window.calculateResult();
    expect(window.currentExpression).toBe("25");
  });

  test("updates the display after squaring", () => {
    window.currentExpression = "4";
    window.squareResult();
    expect(document.getElementById("result").value).toBe("(4)**2");
  });
});
