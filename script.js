if (typeof document === "undefined") {
  throw new Error("Tento skript potrebuje DOM na strane prehliadača.");
}

const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menuButton.setAttribute("aria-label", expanded ? "Otvoriť navigáciu" : "Zatvoriť navigáciu");
    navLinks.classList.toggle("is-open", !expanded);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    });
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

const monthlyInput = document.querySelector("#monthly-investment");
const termInput = document.querySelector("#investment-term");
const reduceMotion = typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;
const heroInvestmentResult = document.querySelector("#hero-investment-result");
const heroResultLabel = document.querySelector("#hero-result-label");
const heroInvestmentMonthly = document.querySelector("#hero-investment-monthly");
const heroInvestmentYears = document.querySelector("#hero-investment-years");
const heroContributionsValue = document.querySelector("#hero-contributions-value");
const heroGrowthValue = document.querySelector("#hero-growth-value");
const heroContributionsBar = document.querySelector("#hero-contributions-bar");
const heroGrowthBar = document.querySelector("#hero-growth-bar");
const heroBreakdown = document.querySelector("#hero-investment-breakdown");
const comparisonLines = {
  low: document.querySelector("#comparison-low-line"),
  mid: document.querySelector("#comparison-mid-line"),
  high: document.querySelector("#comparison-high-line")
};
const comparisonValues = {
  low: document.querySelector("#comparison-low-value"),
  mid: document.querySelector("#comparison-mid-value"),
  high: document.querySelector("#comparison-high-value")
};
const comparisonTermLabel = document.querySelector("#comparison-term-label");
const comparisonScenarios = [
  { key: "low", annualRate: 0.02 },
  { key: "mid", annualRate: 0.05 },
  { key: "high", annualRate: 0.07 }
];
function updateComparison(monthlyAmount, years) {
  if (!comparisonTermLabel || Object.values(comparisonLines).some((line) => !line) || Object.values(comparisonValues).some((value) => !value)) return;

  const currency = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 0 });
  const scenarios = comparisonScenarios.map(({ key, annualRate }) => {
    const monthlyRate = annualRate / 12;
    const balances = [0];
    let balance = 0;

    for (let month = 1; month <= years * 12; month += 1) {
      balance = balance * (1 + monthlyRate) + monthlyAmount;
      balances.push(balance);
    }

    return { key, balances, total: balance };
  });
  const maximum = Math.max(...scenarios.map(({ total }) => total));

  scenarios.forEach(({ key, balances, total }) => {
    const path = balances.map((value, index) => {
      const x = 44 + (index / (balances.length - 1)) * 566;
      const y = 200 - (value / maximum) * 176;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ");

    comparisonLines[key].setAttribute("d", path);
    comparisonValues[key].textContent = `${currency.format(total)} €`;
  });

  comparisonTermLabel.textContent = `${years} ${years === 1 ? "rok" : years < 5 ? "roky" : "rokov"}`;
}

function updateEstimate() {
  if (!monthlyInput || !termInput) return;

  const monthlyAmount = Number(monthlyInput.value);
  const years = Number(termInput.value);
  const monthlyRate = 0.05 / 12;
  const total = monthlyAmount * ((Math.pow(1 + monthlyRate, years * 12) - 1) / monthlyRate);
  const currency = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 0 });

  const monthlyValue = document.querySelector("#monthly-value");
  const termValue = document.querySelector("#term-value");
  const investmentResult = document.querySelector("#investment-result");

  if (monthlyValue) monthlyValue.textContent = `${currency.format(monthlyAmount)} €`;
  if (termValue) termValue.textContent = `${years} ${years === 1 ? "rok" : years < 5 ? "roky" : "rokov"}`;
  if (investmentResult) investmentResult.textContent = `${currency.format(total)} €`;

  updateComparison(monthlyAmount, years);

  if (!heroInvestmentResult || !heroResultLabel || !heroInvestmentMonthly || !heroInvestmentYears || !heroContributionsValue || !heroGrowthValue || !heroContributionsBar || !heroGrowthBar || !heroBreakdown) return;

  const contributions = monthlyAmount * years * 12;
  const growth = Math.max(0, total - contributions);
  const contributionsPercent = total > 0 ? (contributions / total) * 100 : 0;
  const yearsLabel = `${years} ${years === 1 ? "rok" : years < 5 ? "roky" : "rokov"}`;

  heroInvestmentMonthly.textContent = `${currency.format(monthlyAmount)} € mesačne`;
  heroInvestmentYears.textContent = yearsLabel;
  heroResultLabel.textContent = `Modelová hodnota za ${yearsLabel}`;
  heroInvestmentResult.textContent = `${currency.format(total)} €`;
  heroContributionsValue.textContent = `${currency.format(contributions)} €`;
  heroGrowthValue.textContent = `${currency.format(growth)} €`;
  heroContributionsBar.style.width = `${contributionsPercent}%`;
  heroGrowthBar.style.width = `${100 - contributionsPercent}%`;
  heroBreakdown.setAttribute(
    "aria-label",
    `Z modelovej hodnoty ${currency.format(total)} eur tvoria vklady ${currency.format(contributions)} eur a modelový rast ${currency.format(growth)} eur.`
  );
}

if (monthlyInput && termInput) {
  monthlyInput.addEventListener("input", updateEstimate);
  termInput.addEventListener("input", updateEstimate);
  updateEstimate();
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.querySelector("#form-message");
    if (!message) return;
    message.textContent = "Formulár zatiaľ nie je pripojený k e-mailu a dopyt sa neodoslal.";
    message.classList.add("is-error");
  });
}
const revealTargets = document.querySelectorAll(
  ".section, .service-card, .detail-card, .calculator-card, .contact-form"
);

if (revealTargets.length && "IntersectionObserver" in window && !reduceMotion) {
  document.body.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}
