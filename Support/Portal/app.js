(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const fault = (params.get("fault") || "none").toLowerCase();
  const scenario = params.get("scenario") || "CONTROL";
  const storageKey = "autochaos.employees";
  const faults = {
    none: "NONE",
    popup: "UNEXPECTED POPUP",
    slow_submit: "SLOW RESPONSE",
    rename_button: "BUTTON TEXT DRIFT",
    missing_button: "MISSING SUBMIT",
    post_commit_error: "POST-COMMIT ERROR"
  };
  const $ = (id) => document.getElementById(id);

  if (params.get("reset") === "1") localStorage.removeItem(storageKey);

  function records() {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
    catch (_) { return []; }
  }

  function save(items) { localStorage.setItem(storageKey, JSON.stringify(items)); }

  function setMessage(id, text) {
    let node = $(id);
    if (!node && text) {
      node = document.createElement("div");
      node.id = id;
      node.className = id === "successBanner" ? "banner success" : "banner error";
      node.setAttribute("role", id === "successBanner" ? "status" : "alert");
      const form = $("employeeForm");
      form.parentNode.insertBefore(node, form.nextSibling);
    }
    if (!node) return;
    node.textContent = text;
    node.hidden = !text;
    if (!text && node.parentNode) node.remove();
  }

  function render() {
    const items = records();
    $("faultBadge").textContent = faults[fault] || fault.toUpperCase();
    $("scenarioLabel").textContent = scenario;
    $("recordCount").textContent = String(items.length);
    $("recordsSummary").textContent = items.length === 1 ? "1 record" : `${items.length} records`;
    const body = $("employeeTableBody");
    body.innerHTML = "";
    if (!items.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="5">No employee records have been created.</td></tr>';
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("tr");
      [item.id, item.name, item.department, new Date(item.createdAt).toLocaleTimeString(), "COMMITTED"].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  function showPopup() {
    $("chaosPopup").hidden = false;
    $("lastAction").textContent = "Popup blocked";
  }

  function finishSuccess(record) {
    const items = records();
    items.push(record);
    save(items);
    $("lastAction").textContent = "Employee created";
    setMessage("successBanner", `Employee ${record.id} created successfully.`);
    setMessage("errorBanner", "");
    render();
  }

  $("faultBadge").textContent = faults[fault] || fault.toUpperCase();
  $("scenarioLabel").textContent = scenario;
  if (fault === "rename_button") {
    document.body.classList.add("rename-button");
    $("submitLabel").setAttribute("data-drift-label", "REGISTER EMPLOYEE");
  }
  if (fault === "missing_button") {
    $("submitBtn").disabled = true;
    $("submitBtn").setAttribute("aria-label", "SUBMIT UNAVAILABLE");
    document.body.classList.add("missing-button");
  }
  if (fault === "popup") window.setTimeout(showPopup, 500);
  $("closePopupBtn").addEventListener("click", function () {
    $("chaosPopup").hidden = true;
    $("lastAction").textContent = "Popup dismissed";
  });
  if (fault !== "popup") $("chaosPopup").remove();
  $("successBanner").remove();
  $("errorBanner").remove();

  $("employeeForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const record = {
      id: $("employeeId").value.trim(),
      name: $("employeeName").value.trim(),
      department: $("department").value.trim(),
      createdAt: new Date().toISOString()
    };
    if (!record.id || !record.name || !record.department) {
      setMessage("errorBanner", "Complete all employee fields before submitting.");
      return;
    }
    const button = $("submitBtn");
    button.disabled = true;
    $("lastAction").textContent = fault === "slow_submit" ? "Processing..." : "Submitting...";
    setMessage("successBanner", "");
    setMessage("errorBanner", "");
    const commit = function () {
      if (fault === "post_commit_error") {
        const items = records();
        items.push(record);
        save(items);
        $("lastAction").textContent = "Response lost";
        setMessage("errorBanner", "Connection lost after the transaction was committed. Verify portal state before retrying.");
        render();
      } else {
        finishSuccess(record);
      }
      button.disabled = false;
    };
    if (fault === "slow_submit") window.setTimeout(commit, 2400);
    else window.setTimeout(commit, 180);
  });

  render();
}());
