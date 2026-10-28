
const diagram = document.getElementById("diagram");
const form = document.getElementById("test-form");
const input = document.getElementById("user-input");
const result = document.getElementById("result");
const traceSection = document.getElementById("trace-section");
const trace = document.getElementById("trace");
const finalState = document.getElementById("final-state");
const transitionTable = document.getElementById("transition-table");

const states = [
  { x: 70,  y: 125, name: "q0" },
  { x: 190, y: 125, name: "q1" },
  { x: 310, y: 125, name: "q2" },
  { x: 430, y: 125, name: "q3" },
  { x: 550, y: 125, name: "q4" }
];

// Every a or b advances one state.
// q0 is the only accepting state.
function nextState(state, symbol) {
  return (state + 1) % 5;
}

function renderDiagram(currentState = -1) {
  const parts = [
    `<defs>
      <marker id="arrow" markerWidth="8" markerHeight="8"
        refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#8995aa"/>
      </marker>
    </defs>`
  ];

  // Start arrow
  parts.push(`
    <path d="M 8 125 L 36 125" stroke="#8995aa"
      stroke-width="2" marker-end="url(#arrow)" fill="none"/>
  `);

  // Transitions between successive states
  for (let i = 0; i < 4; i++) {
    const x1 = states[i].x + 22;
    const x2 = states[i + 1].x - 22;

    parts.push(`
      <path d="M ${x1} 125 L ${x2} 125"
        stroke="#8995aa" stroke-width="2"
        marker-end="url(#arrow)" fill="none"/>
      <text x="${(x1 + x2) / 2}" y="111"
        text-anchor="middle" font-size="12" fill="#536178">a,b</text>
    `);
  }

  // Wraparound transition q4 -> q0
  parts.push(`
    <path d="M 550 102 C 550 25, 70 25, 70 102"
      stroke="#8995aa" stroke-width="2"
      marker-end="url(#arrow)" fill="none"/>
    <text x="310" y="18" text-anchor="middle"
      font-size="12" fill="#536178">a,b</text>
  `);

  // States
  states.forEach((state, i) => {
    const active = i === currentState;
    const accepting = i === 0;
    const fill = active ? "#6558d3" :
      accepting ? "#e5f7ee" : "#ffffff";
    const stroke = active ? "#5143bf" :
      accepting ? "#15845d" : "#8995aa";
    const textColor = active ? "#ffffff" :
      accepting ? "#15845d" : "#26354b";

    parts.push(`
      <circle cx="${state.x}" cy="${state.y}" r="21"
        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      ${accepting ? `
        <circle cx="${state.x}" cy="${state.y}" r="16"
          fill="none" stroke="${stroke}" stroke-width="1.5"/>
      ` : ""}
      <text x="${state.x}" y="${state.y + 5}"
        text-anchor="middle" font-size="13"
        font-weight="700" fill="${textColor}">${state.name}</text>
    `);
  });

  diagram.innerHTML = parts.join("");
}

function renderTable() {
  transitionTable.innerHTML = states.map((state, i) => `
    <tr>
      <td>${state.name}${i === 0 ? " (start)" : ""}</td>
      <td>q${nextState(i, "a")}</td>
      <td>q${nextState(i, "b")}</td>
      <td class="${i === 0 ? "accept-state" : ""}">
        ${i === 0 ? "Yes ✓" : "No"}
      </td>
    </tr>
  `).join("");
}

function showResult(message, type) {
  result.textContent = message;
  result.className = "result " + type;
}

function simulate(value) {
  const word = value.trim();

  traceSection.hidden = true;
  renderDiagram();

  if (!/^[ab]*$/i.test(word)) {
    showResult("Invalid input. Enter only the letters a and b.", "invalid");
    return;
  }

  const normalized = word.toLowerCase();
  let state = 0;
  const visited = [state];

  for (const symbol of normalized) {
    state = nextState(state, symbol);
    visited.push(state);
  }

  const accepted = state === 0;

  showResult(
    accepted
      ? "✓ Accepted! The string length is divisible by 5."
      : "✗ Rejected! The string length is not divisible by 5.",
    accepted ? "accepted" : "rejected"
  );

  traceSection.hidden = false;

  trace.innerHTML = visited.map((s, index) => {
    const isCurrent = index === visited.length - 1;
    const stateClass = isCurrent ? "trace-step current" : "trace-step";
    const symbol = index > 0 ? ` (${normalized[index - 1]})` : "";

    return `
      ${index > 0 ? '<span class="trace-arrow">→</span>' : ""}
      <span class="${stateClass}">q${s}${symbol}</span>
    `;
  }).join("");

  finalState.textContent =
    `Final state: q${state}. ` +
    (accepted ? "q0 is accepting." : "This state is not accepting.");

  renderDiagram(state);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  simulate(input.value);
});

document.querySelectorAll(".sample").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.value;
    simulate(input.value);
  });
});

renderDiagram();
renderTable();
