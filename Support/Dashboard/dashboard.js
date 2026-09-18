(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const faultNames = { none: "None", popup: "Unexpected popup", slow_submit: "Slow response", rename_button: "Button text drift", missing_button: "Missing submit", post_commit_error: "Post-commit error" };

  function parseCsv(text) {
    const rows = [], row = []; let value = "", quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i], next = text[i + 1];
      if (quoted && ch === '"' && next === '"') { value += '"'; i += 1; continue; }
      if (ch === '"') { quoted = !quoted; continue; }
      if (!quoted && ch === ",") { row.push(value); value = ""; continue; }
      if (!quoted && (ch === "\n" || ch === "\r")) { if (ch === "\r" && next === "\n") i += 1; row.push(value); if (row.some((v) => v !== "")) rows.push(row.splice(0)); value = ""; continue; }
      value += ch;
    }
    if (value.length || row.length) { row.push(value); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map((h) => h.trim());
    return rows.map((values) => Object.fromEntries(headers.map((h, i) => [h, (values[i] || "").trim()])));
  }

  function tag(text, type) { return `<span class="tag ${type}">${text}</span>`; }
  function evidenceLink(path) { if (!path || path === "screenshot unavailable") return "—"; const clean = path.replace(/\\/g, "/").replace(/^.*Evidence[\\/]/i, "../../Evidence/"); return `<a class="evidence-link" target="_blank" href="${clean}">view PNG</a>`; }

  function render(rows) {
    if (!rows.length) { $("emptyState").hidden = false; $("resultsView").hidden = true; $("refreshLabel").textContent = "Waiting for campaign data"; return; }
    $("emptyState").hidden = true; $("resultsView").hidden = false;
    const total = rows.length, pass = rows.filter((r) => r.verdict === "PASS").length, fail = total - pass;
    const safe = rows.filter((r) => r.actual_behavior === "SAFE_FAIL").length;
    const recovered = rows.filter((r) => r.actual_behavior === "RECOVERED_SUCCESS").length;
    const critical = rows.filter((r) => r.actual_behavior === "UNSAFE_FAIL" || r.verdict === "FAIL").length;
    const integrityPass = rows.filter((r) => r.data_integrity === "PASS").length;
    const score = Math.round(((pass + safe) / total) * 100);
    $("totalKpi").textContent = total; $("passKpi").textContent = pass; $("safeKpi").textContent = safe; $("failKpi").textContent = critical;
    $("runId").textContent = rows[0].run_id || "local run"; $("runState").textContent = `${total} scenarios · refreshed ${new Date().toLocaleTimeString()}`; $("refreshLabel").textContent = "Live results loaded";
    $("scoreValue").textContent = score; $("scoreLabel").textContent = score >= 80 ? "GOOD CONTROL" : "ATTENTION REQUIRED";
    $("scoreHeadline").textContent = critical ? "Transaction risk detected" : "Faults contained safely";
    $("scoreDescription").textContent = critical ? "The campaign exposed a state-changing failure that needs idempotency or reconciliation." : "The automation either recovered or failed without changing business state.";
    $("scoreRing").style.background = `conic-gradient(var(--teal) ${score * 3.6}deg, #e7edf5 ${score * 3.6}deg)`;
    $("recoveryMetric").textContent = `${Math.round(((recovered + rows.filter((r) => r.actual_behavior === "SUCCESS").length) / total) * 100)}%`;
    $("integrityMetric").textContent = `${Math.round((integrityPass / total) * 100)}%`;
    $("continuityMetric").textContent = `${total}/${total}`;
    $("findingCount").textContent = critical;
    $("findingsList").innerHTML = critical ? rows.filter((r) => r.verdict === "FAIL").map((r) => `<div class="finding"><strong>${r.scenario_id} · Transaction uncertainty</strong><p>The portal state changed despite a failure response. Blind retries could duplicate the business action.</p></div>`).join("") : '<div class="no-findings">No critical findings in this campaign. Every injected fault was contained.</div>';
    $("timeline").innerHTML = rows.map((r, i) => { const type = r.verdict === "FAIL" ? "fail" : r.actual_behavior === "SAFE_FAIL" ? "safe" : "pass"; return `<div class="timeline-node ${type} done"><div class="timeline-dot">${i + 1}</div><strong>${r.scenario_id}</strong><span>${faultNames[r.fault_mode] || r.fault_mode}</span></div>`; }).join("");
    $("tableSummary").textContent = `${pass} pass · ${fail} fail · ${safe} safe failure`;
    $("resultsBody").innerHTML = rows.map((r) => { const verdictType = r.verdict === "FAIL" ? "fail" : r.actual_behavior === "SAFE_FAIL" ? "safe" : "pass"; const integrityType = r.data_integrity === "FAIL" ? "fail" : r.data_integrity === "PASS" ? "pass" : "unknown"; return `<tr><td><strong>${r.scenario_id}</strong><br><span class="muted">${r.scenario_name}</span></td><td>${faultNames[r.fault_mode] || r.fault_mode}</td><td>${r.expected_behavior}</td><td>${r.actual_behavior}</td><td>${tag(r.verdict, verdictType)}</td><td>${tag(r.data_integrity, integrityType)}</td><td>${r.duration_ms || "—"} ms</td><td>${evidenceLink(r.evidence_file)}</td></tr>`; }).join("");
  }

  async function load() { try { const response = await fetch(`../../Data/Output/results.csv?t=${Date.now()}`, { cache: "no-store" }); if (!response.ok) throw new Error("not ready"); render(parseCsv(await response.text())); } catch (_) { render([]); } }
  $("refreshBtn").addEventListener("click", load); load(); window.setInterval(load, 5000);
}());

