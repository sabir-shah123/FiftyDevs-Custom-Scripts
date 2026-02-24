(function () {

  console.log(" Battery + Pricing Engine Loaded");


  /* ================= CONFIG ================= */

  const BASE_PRICE = 224.99;
  const INSTALL_PRICE = 19.99;
  const SILVER_PRICE = 29.99;
  const GOLD_PRICE = 49.99;
  const OLD_BATTERY_CREDIT = 25.00; // renamed

  const SPREADSHEET_ID = '1tOdQNNN-KYlwGhY9FosdTF7m7u1W8ZnVxshm75PdxY8';
  const GID = '0';

  const SHEET_URL =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;


  /* ================= STATE ================= */

  let cachedData = null;
  let lastBatteryKey = null;
  let lastPricingState = null;
  let observerStarted = false;


  /* ================= HELPERS ================= */

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function triggerInput(el) {
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }


  /* ================= LOAD BATTERY DATA ================= */

  async function loadBatteryData() {

    if (cachedData) return cachedData;

    const res = await fetch(SHEET_URL);
    const text = await res.text();

    const jsonString = text.substring(47).slice(0, -2);
    const json = JSON.parse(jsonString);

    const headers = ['Year', 'Make', 'Model', 'Engine', 'Battery_Group'];

    cachedData = json.table.rows.map(row => {

      const obj = {};
      row.c.forEach((cell, i) => obj[headers[i]] = cell?.v ?? '');
      return obj;

    });

    return cachedData;
  }


  /* ================= VEHICLE VALUES ================= */

  function getVehicleValues() {

    const slide1 = document.querySelector(".slide-no-1");
    if (!slide1) return null;

    function read(labelText) {

      const labels = slide1.querySelectorAll(".field-label");

      for (let label of labels) {

        if (label.innerText.toLowerCase().includes(labelText)) {

          const wrap = label.closest(".form-field-wrapper");
          const val = wrap?.querySelector(".multiselect__single");

          if (val) return val.innerText.trim();
        }
      }

      return "";
    }

    return {
      year: read("year"),
      make: read("make"),
      model: read("model")
    };
  }


  /* ================= FIND BATTERY ================= */

  async function findBatteryGroupOldWorking() {

    const el = document.getElementById("suggested_battery_group");
    if (!el) return;

    const vehicle = getVehicleValues();
    if (!vehicle) return;

    const { year, make, model } = vehicle;
    if (!year || !make || !model) return;

    const key = `${year}|${make}|${model}`;

    if (key === lastBatteryKey) return;
    lastBatteryKey = key;

    el.textContent = "Checking...";

    const data = await loadBatteryData();

    const matches = data.filter(row =>
      String(row.Year) === String(year) &&
      row.Make.toLowerCase() === make.toLowerCase() &&
      row.Model.toLowerCase().includes(model.toLowerCase())
    );

    if (!matches.length) {
      el.textContent = "Not Found";
      console.log(" Battery not found");
      return;
    }

    const group = matches[0].Battery_Group;
    el.textContent = group;

    console.log(" Battery Group Found:", group);

    const ghlBatteryInput = document.querySelector(
  "input[data-q='battery_group']"
);

if (ghlBatteryInput) {

  ghlBatteryInput.value = group;

  // Trigger GHL events so value persists
  ghlBatteryInput.dispatchEvent(
    new Event("input", { bubbles: true })
  );

  ghlBatteryInput.dispatchEvent(
    new Event("change", { bubbles: true })
  );
}
  }


  function setBatteryFieldValue(group) {
  console.log("updating with "+ group);
  let attempts = 0;

  const interval = setInterval(() => {

    const input = document.querySelector(
      "input[data-q='battery_group']"
    );

    if (input) {

      input.value = group;

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(" Battery field updated:", group);

      clearInterval(interval);
    }

    attempts++;

    if (attempts > 20) {
      clearInterval(interval);
    }

  }, 200);
}


  async function findBatteryGroup() {

  const el = document.getElementById("suggested_battery_group");
  if (!el) return;

  const vehicle = getVehicleValues();
  if (!vehicle) return;

  const { year, make, model } = vehicle;
  if (!year || !make || !model) return;

  const key = `${year}|${make}|${model}`;

  if (key === lastBatteryKey) return;
  lastBatteryKey = key;

  el.textContent = "Checking...";

  const data = await loadBatteryData();

  const matches = data.filter(row =>
    String(row.Year) === String(year) &&
    row.Make.toLowerCase() === make.toLowerCase() &&
    row.Model.toLowerCase().includes(model.toLowerCase())
  );

  let group = "N/A";

  if (!matches.length) {

    console.log(" Battery not found");

  } else {

    group = matches[0].Battery_Group;
    console.log(" Battery Group Found:", group);

  }

  // Always update UI
  el.textContent = group;

  // Always update GHL field
  setBatteryFieldValue(group);
}


  /* ================= FIELD FINDERS ================= */

  function oldBatteryCheckbox() {
    return document.querySelector(
      "input[data-q='will_you_provide_your_old_battery']"
    );
  }

  function findCheckbox(text) {

    const labels = document.querySelectorAll("label");

    for (let label of labels) {

      if (label.innerText.toLowerCase().includes(text)) {

        const input = label.previousElementSibling;
        if (input && input.type === "checkbox")
          return input;
      }
    }

    return null;
  }

  function findWarranty() {

    const radios = document.querySelectorAll("input[type=radio]");

    for (let r of radios) {
      if (r.checked) return r.value.toLowerCase();
    }

    return "";
  }

  function getAmountField() {
    return document.querySelector("[data-q='amount_payable']");
  }


  /* ================= UPDATE SUMMARY ================= */

  function updateSummary(install, warranty, oldBatteryCredit, total) {

    const installRow = document.getElementById("row_install");
    const warrantyRow = document.getElementById("row_warranty");
    const coreRow = document.getElementById("row_core"); // FIXED
    const totalEl = document.getElementById("pricing_total");

    if (installRow)
      installRow.children[1].textContent = money(install);

    if (warrantyRow)
      warrantyRow.children[1].textContent = money(warranty);

    if (coreRow)
      coreRow.children[1].textContent =
        oldBatteryCredit > 0
          ? "-$" + oldBatteryCredit.toFixed(2)
          : "$0.00";

    if (totalEl)
      totalEl.textContent = money(total);

    const amountInput = getAmountField();

    if (amountInput) {
      amountInput.value = total.toFixed(2);
      triggerInput(amountInput);
    }
  }


  /* ================= CALCULATE PRICING ================= */

  function calculatePricing() {

    const installBox = findCheckbox("installation");
    const oldBatteryBox = oldBatteryCheckbox();

    const warrantyValue = findWarranty();

    const installChecked = installBox?.checked || false;
    const oldBatteryChecked = oldBatteryBox?.checked || false;

    const state =
      installChecked + "|" +
      oldBatteryChecked + "|" +
      warrantyValue;

    if (state === lastPricingState) return;
    lastPricingState = state;

    let total = BASE_PRICE;
    let install = 0;
    let warranty = 0;
    let oldBatteryCredit = 0;

    if (installChecked) {
      install = INSTALL_PRICE;
      total += install;
    }

    if (warrantyValue.includes("silver")) {
      warranty = SILVER_PRICE;
      total += warranty;
    }

    if (warrantyValue.includes("gold")) {
      warranty = GOLD_PRICE;
      total += warranty;
    }

    if (oldBatteryChecked) {
      oldBatteryCredit = OLD_BATTERY_CREDIT;
      total -= oldBatteryCredit;
    }

    console.log(" Pricing:", total);

    updateSummary(install, warranty, oldBatteryCredit, total);
  }


  /* ================= OBSERVER ================= */

  function startObserver() {

    if (observerStarted) return;
    observerStarted = true;

    const form = document.getElementById("_builder-form");
    if (!form) return;

    let lastSlideVisible = false;

    const observer = new MutationObserver(() => {

      const slide2 = document.querySelector(".slide-no-2");
      if (!slide2) return;

      const visible = slide2.classList.contains("ghl-page-current");

      if (visible && !lastSlideVisible) {

        console.log(" Slide 2 Entered");

        findBatteryGroup();
        calculatePricing();
      }

      lastSlideVisible = visible;

    });

    observer.observe(form, {
      childList: true,
      subtree: true,
      attributes: true
    });

    console.log("👀 Observer Running");
  }


  /* ================= GLOBAL LISTENERS ================= */

  document.addEventListener("change", () => {
    setTimeout(calculatePricing, 120);
  });

  document.addEventListener("click", () => {
    setTimeout(calculatePricing, 150);
  });


  /* ================= INIT ================= */

  async function init() {

    await loadBatteryData();
    startObserver();

    setTimeout(() => {
      findBatteryGroup();
      calculatePricing();
    }, 1000);
  }

  window.addEventListener("load", init);
  init();


})();
