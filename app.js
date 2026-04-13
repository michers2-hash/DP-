(function () {
  "use strict";

  const display = document.getElementById("display");
  const expressionEl = document.getElementById("expression");
  const keys = document.getElementById("keys");

  let current = "0";
  let stored = null;
  let pendingOp = null;
  let fresh = true;

  function formatDisplay(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "오류";
    const abs = Math.abs(n);
    if (abs >= 1e12 || (abs > 0 && abs < 1e-9)) {
      return n.toExponential(6);
    }
    if (n === 0) return "0";
    let s = n.toPrecision(14).replace(/\.?0+$/, "");
    if (s === "" || s === "-") s = "0";
    if (s.length > 14) s = n.toExponential(6);
    return s;
  }

  function updateView(expr) {
    display.textContent = formatDisplay(current);
    expressionEl.textContent = expr ?? "";
  }

  function opSymbol(op) {
    if (op === "*") return "×";
    if (op === "/") return "÷";
    return op;
  }

  function applyOp(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function commitPending() {
    if (stored === null || pendingOp === null) return;
    const a = stored;
    const b = Number(current);
    const r = applyOp(a, b, pendingOp);
    current = String(r);
    stored = null;
    pendingOp = null;
    fresh = true;
  }

  function inputDigit(d) {
    if (fresh) {
      current = d;
      fresh = false;
    } else {
      if (current === "0" && d !== "0") current = d;
      else if (current === "0" && d === "0") return;
      else if (current.replace(".", "").length < 14) current += d;
    }
    updateView(buildExprPreview());
  }

  function inputDecimal() {
    if (fresh) {
      current = "0.";
      fresh = false;
    } else if (!current.includes(".")) {
      current += ".";
    }
    updateView(buildExprPreview());
  }

  function buildExprPreview() {
    if (stored !== null && pendingOp !== null) {
      return `${formatDisplay(String(stored))} ${opSymbol(pendingOp)}`;
    }
    return "";
  }

  function setOperator(op) {
    if (stored !== null && pendingOp !== null && !fresh) {
      commitPending();
      if (!Number.isFinite(Number(current))) {
        updateView("");
        return;
      }
    }

    const n = Number(current);
    if (!Number.isFinite(n)) return;

    stored = n;
    pendingOp = op;
    fresh = true;
    updateView(buildExprPreview());
  }

  function equals() {
    if (pendingOp === null) return;
    commitPending();
    updateView("");
  }

  function clearAll() {
    current = "0";
    stored = null;
    pendingOp = null;
    fresh = true;
    updateView("");
  }

  function toggleSign() {
    const n = Number(current);
    if (!Number.isFinite(n)) return;
    current = String(-n);
    fresh = false;
    updateView(buildExprPreview());
  }

  function percent() {
    const n = Number(current);
    if (!Number.isFinite(n)) return;
    current = String(n / 100);
    fresh = true;
    updateView(buildExprPreview());
  }

  keys.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {
      case "digit":
        inputDigit(btn.dataset.value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        setOperator(btn.dataset.value);
        break;
      case "equals":
        equals();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
      default:
        break;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, [contenteditable=true]")) return;

    const k = e.key;
    if (k >= "0" && k <= "9") {
      e.preventDefault();
      inputDigit(k);
      return;
    }
    if (k === ".") {
      e.preventDefault();
      inputDecimal();
      return;
    }
    if (k === "+" || k === "-") {
      e.preventDefault();
      setOperator(k);
      return;
    }
    if (k === "*") {
      e.preventDefault();
      setOperator("*");
      return;
    }
    if (k === "/") {
      e.preventDefault();
      setOperator("/");
      return;
    }
    if (k === "Enter" || k === "=") {
      e.preventDefault();
      equals();
      return;
    }
    if (k === "Escape" || k.toLowerCase() === "c") {
      e.preventDefault();
      clearAll();
      return;
    }
    if (k === "Backspace") {
      e.preventDefault();
      if (!fresh && current.length > 1) {
        current = current.slice(0, -1);
      } else {
        current = "0";
        fresh = true;
      }
      updateView(buildExprPreview());
    }
  });

  updateView("");
})();
