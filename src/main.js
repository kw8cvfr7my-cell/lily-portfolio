import "./style.css";
import "./exhibits.css";
import { mountExhibit } from "./exhibits.js";
import { categories, themes, profile } from "./content.js";
import { escapeHTML } from "./schema.js";
import { createIsland } from "./island.js";
import { ForestAudio } from "./audio.js";
import { COPY, THEME_COPY, field } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const visited = new Set();
const audio = new ForestAudio();
const knownLocales = new Set(["en", "zh"]);
let locale = localStorage.getItem("portfolio-language") || "en";
if (!knownLocales.has(locale)) locale = "en";
let island;
let active = -1;
let started = false;
let toastTimer;
let webglFailed = false;
let currentTheme = "forest";

function text(entry, key) {
  return field(entry, key, locale);
}

function setStatus(kind, index = -1) {
  const copy = COPY[locale];
  if (kind === "arrived" && index >= 0) $("walk-status").textContent = `${copy.arrival} · ${text(categories[index], "short")}`;
  else if (kind === "heading" && index >= 0) $("walk-status").textContent = `${copy.headingTo} · ${text(categories[index], "short")}`;
  else if (kind === "overview") $("walk-status").textContent = copy.overviewStatus;
  else $("walk-status").textContent = started ? copy.welcomeMessage : copy.walkStatus;
}

function renderProfile() {
  $("welcome-name").textContent = locale === "zh" ? profile.nameZh || profile.name : profile.name;
  $("welcome-role").textContent = locale === "zh" ? profile.subtitleZh || profile.subtitle : profile.subtitle;
  $("welcome-story").textContent = text(profile, "intro");
  $("welcome-transition").textContent = text(profile, "transition");
  $("profile-capabilities").setAttribute("aria-label", COPY[locale].profileCapabilities);
  $("profile-capabilities").innerHTML = (profile.capabilities || [])
    .map((capability) => `<span>${escapeHTML(text(capability, "name"))}</span>`)
    .join("");
  $("education-strip").setAttribute("aria-label", COPY[locale].education);
  $("education-strip").innerHTML = (profile.education || [])
    .map((education) => `<article><b>${escapeHTML(text(education, "degree"))}</b><span>${escapeHTML(text(education, "institution"))}</span><small>${escapeHTML(text(education, "period"))}</small></article>`)
    .join("");
}

function renderNavigation() {
  const campLabels = $("camp-labels");
  const categoryNav = $("category-nav");
  const mapSites = $("map-sites");
  const welcomeNav = $("welcome-nav");
  for (const element of [campLabels, categoryNav, mapSites, welcomeNav]) element.replaceChildren();

  categories.forEach((category, index) => {
    //const name = text(category, "name");
    const defaultName = text(category, "name");
    const name =
  index === 0 && locale === "zh"
    ? ({
        forest: "洞察森林",
        desert: "探索沙洲",
        ocean: "探索浅海",
      }[currentTheme] || defaultName)
    : defaultName;
    
    const short = text(category, "short");
    const label = document.createElement("button");
    label.className = "camp-label";
    label.dataset.camp = index;
    label.setAttribute("aria-label", `${COPY[locale].headingTo} ${name}`);
    label.innerHTML = `<span>${category.number}</span><b>${escapeHTML(short)}</b><i></i>`;
    campLabels.append(label);

    const nav = document.createElement("button");
    nav.dataset.camp = index;
    nav.innerHTML = `<span>${category.number}</span>${escapeHTML(name)}`;
    nav.setAttribute("aria-label", `${COPY[locale].headingTo} ${name}`);
    categoryNav.append(nav);

    const quick = document.createElement("button");
    quick.dataset.camp = index;
    quick.innerHTML = `<span>${category.number}</span><b>${escapeHTML(name)}</b><i>↗</i>`;
    welcomeNav.append(quick);

    const dot = document.createElement("button");
    dot.className = "map-site";
    dot.dataset.camp = index;
    dot.style.left = `${50 + (category.arrival[0] / 28) * 100}%`;
    dot.style.top = `${50 + (category.arrival[1] / 28) * 100}%`;
    dot.setAttribute("aria-label", `${COPY[locale].map}: ${name}`);
    mapSites.append(dot);
  });
  $("camp-total").textContent = String(categories.length).padStart(2, "0");
  document.querySelectorAll("[data-camp]").forEach((button) => {
    const index = Number(button.dataset.camp);
    button.classList.toggle("visited", visited.has(index));
    button.classList.toggle("active", index === active);
  });
}

function applyLocale() {
  const copy = COPY[locale];
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en-GB";
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = copy[element.dataset.copy];
    if (value !== undefined) element.textContent = value;
  });
  document.querySelectorAll("[data-aria]").forEach((element) => {
    const value = copy[element.dataset.aria];
    if (value !== undefined) element.setAttribute("aria-label", value);
  });

  $("language-toggle").textContent = copy.language;
  $("language-toggle").setAttribute("aria-label", copy.switchLanguage);
  $("brand-title").textContent = locale === "zh" ? profile.titleZh || profile.title : profile.title;
  $("brand-subtitle").textContent = locale === "zh" ? profile.subtitleZh || profile.subtitle : profile.subtitle;
  $("home").setAttribute("aria-label", locale === "zh" ? "返回首页介绍" : "Show home introduction");
  $("sound").setAttribute("aria-label", audio.enabled ? copy.soundOff : copy.soundOn);
  $("world").setAttribute("aria-label", `${profile.title} ${locale === "zh" ? "三维场景" : "3D environment"}`);
  $("work").setAttribute("aria-label", copy.work);
  $("close-work").setAttribute("aria-label", copy.closeDetails);
  $("evidence-dialog").setAttribute("aria-label", copy.fullImage);
  $("close-evidence").setAttribute("aria-label", copy.closeImage);
  const primaryLink = profile.links?.[0];
  $("channel").hidden = !primaryLink;
  if (primaryLink) $("channel").querySelector("span").textContent = text(primaryLink, "label");

  document.title = `${locale === "zh" ? profile.titleZh || profile.title : profile.title} · ${profile.name}`;
  document.querySelector('meta[name="description"]').content = text(profile, "intro");
  $("theme-english").textContent = THEME_COPY[currentTheme][locale].english;
  $("theme-caption").textContent = THEME_COPY[currentTheme][locale].caption;
//  renderNavigation();
  renderProfile();
  renderNavigation();
  if (active >= 0) {
    const category = categories[active];
    $("panel-english").textContent = text(category, "english");
    $("panel-category").textContent = `${copy.fieldNotes} / ${category.number}`;
    $("work-title").textContent = text(category, "name");
    $("work-intro").textContent = text(category, "intro");
    $("work-description").textContent = text(category, "description");
    mountExhibit($("work-sections"), category.id, locale);
  }
  setStatus(active >= 0 ? "arrived" : started ? "overview" : "idle", active);
}

function toast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => ($("toast").hidden = true), 3600);
}

function begin() {
  started = true;
  document.body.classList.add("exploring");
  $("welcome").setAttribute("inert", "");
  setStatus("idle");
}

function closeWork() {
  active = -1;
  $("work").hidden = true;
  document.body.classList.remove("panel-open");
  document.querySelectorAll("#category-nav button").forEach((button) => button.classList.remove("active"));
}

function openWork(index) {
  const category = categories[index];
  if (!category) return;
  begin();
  active = index;
  visited.add(index);
  $("work").hidden = false;
  document.body.classList.add("panel-open");
  $("panel-number").textContent = category.number;
  $("panel-english").textContent = text(category, "english");
  $("panel-category").textContent = `${COPY[locale].fieldNotes} / ${category.number}`;
  $("work-title").textContent = text(category, "name");
  $("work-intro").textContent = text(category, "intro");
  $("work-description").textContent = text(category, "description");
  mountExhibit($("work-sections"), category.id, locale);
  $("work").scrollTop = 0;
  $("visited-count").textContent = String(visited.size).padStart(2, "0");
  renderNavigation();
  setStatus("arrived", index);
}

function navigate(index) {
  if (!categories[index]) return;
  begin();
  closeWork();
  if (webglFailed) {
    openWork(index);
    return;
  }
  island?.travelTo(index);
  setStatus("heading", index);
}

document.addEventListener("click", (event) => {
  const destination = event.target.closest("[data-camp]");
  if (destination) navigate(Number(destination.dataset.camp));
});

$("language-toggle").addEventListener("click", () => {
  locale = locale === "en" ? "zh" : "en";
  localStorage.setItem("portfolio-language", locale);
  applyLocale();
});

$("explore").addEventListener("click", begin);
$("close-work").addEventListener("click", closeWork);
$("continue").addEventListener("click", closeWork);
$("overview").addEventListener("click", () => {
  closeWork();
  island?.overview();
  setStatus("overview");
});
$("home").addEventListener("click", () => {
  closeWork();
  island?.stop();
  island?.overview();
  started = false;
  document.body.classList.remove("exploring");
  $("welcome").removeAttribute("inert");
  setStatus("idle");
});
$("channel").addEventListener("click", () => {
  const link = profile.links?.[0];
  if (link) window.open(link.url, "_blank", "noopener,noreferrer");
});

const help = $("help-dialog");
$("help").addEventListener("click", () => {
  island?.stop();
  help.showModal();
});
$("close-help").addEventListener("click", () => help.close());
$("help-done").addEventListener("click", () => help.close());
help.addEventListener("click", (event) => {
  if (event.target === help) {
    const rect = help.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) help.close();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !help.open && !$("evidence-dialog").open) closeWork();
});

document.querySelectorAll(".theme-picker button").forEach((button) =>
  button.addEventListener("click", () => {
    const id = button.dataset.theme;
    currentTheme = id;
    document.body.dataset.theme = id;
    document.documentElement.style.setProperty("--accent", themes[id].accent);
    document.querySelectorAll(".theme-picker button").forEach((entry) => entry.setAttribute("aria-pressed", String(entry === button)));
    $("theme-english").textContent = THEME_COPY[id][locale].english;
    $("theme-caption").textContent = THEME_COPY[id][locale].caption;
   // renderNavigation();
    renderNavigation();
    const art = $("panel-art");
    const drawings = {
      forest: '<path d="m38 98 74-75 76 75H38Zm74-75v75m0-47-30 47m30-47 28 47M27 99h178"/><circle cx="184" cy="30" r="12"/>',
      desert: '<path d="M8 94q45-44 90-5t130-9M7 110q80-43 146-5M121 81V31m0 20q-19 0-19-18m19 7q17 0 17-17"/><circle cx="190" cy="31" r="17"/>',
      ocean: '<path d="M12 84q18-12 36 0t36 0t36 0t36 0t36 0t36 0M12 104q18-12 36 0t36 0t36 0t36 0t36 0t36 0M91 65l20-17-20-17q49-24 72 17-23 39-72 17Z"/><circle cx="147" cy="45" r="2"/><circle cx="187" cy="22" r="5"/>',
    };
    art.innerHTML = `<g stroke="currentColor" stroke-width="1.5" fill="none">${drawings[id]}</g>`;
    island?.setTheme(id);
    audio.setNight(id === "ocean");
  }),
);

$("sound").addEventListener("click", async () => {
  try {
    const enabled = await audio.toggle();
    $("sound").setAttribute("aria-pressed", String(enabled));
    $("sound").setAttribute("aria-label", enabled ? COPY[locale].soundOff : COPY[locale].soundOn);
  } catch {
    toast(COPY[locale].imageUnavailable);
  }
});
document.addEventListener("visibilitychange", () => {
  if (audio.context) {
    if (document.hidden) audio.context.suspend();
    else if (audio.enabled) audio.context.resume();
  }
});

document.querySelectorAll(".touch-pad button").forEach((button) => {
  const [x, z] = button.dataset.dir.split(",").map(Number);
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    begin();
    island?.setTouchDirection(x, z);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(name, () => island?.setTouchDirection(0, 0));
});

applyLocale();
try {
  island = createIsland($("world"), {
    onReady: () => {
      $("loading").classList.add("loaded");
      setTimeout(() => ($("loading").hidden = true), 800);
    },
    onArrive: openWork,
    onLeave: () => {
      if (active >= 0) closeWork();
    },
    onMove: () => {
      begin();
      closeWork();
    },
    onBoundary: () => toast(COPY[locale].boundary),
  });
} catch (error) {
  console.error(error);
  webglFailed = true;
  $("loading").hidden = true;
  $("fallback").hidden = false;
  $("camp-labels").hidden = true;
}
