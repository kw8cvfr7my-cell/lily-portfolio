import { categories, profile } from "./content.js";
import { escapeHTML as h, safeUrl } from "./schema.js";
import { COPY, field } from "./i18n.js";

const states = new Map();
let current;
const links = (items = [], locale = "en") =>
  (Array.isArray(items) ? items : [])
    .filter((link) => safeUrl(link.url))
    .map((link) => `<a class="action-link" href="${h(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer">${h(field(link, "label", locale) || COPY[locale].seeLink)} ↗</a>`)
    .join("");
const metrics = (items = [], locale = "en") =>
  Array.isArray(items) && items.length
    ? `<div class="ex-metrics">${items.map((metric) => `<div><strong>${h(metric.value)}</strong><span>${h(field(metric, "label", locale))}</span></div>`).join("")}</div>`
    : "";
const imageUrl = (path) =>
  path?.startsWith("/")
    ? `${import.meta.env.BASE_URL}${path.slice(1)}`
    : path;
const picture = (item, cls = "", locale = "en") => {
  if (!item.image) return "";
  const alt = field(item, "alt", locale) || field(item, "title", locale);
  const src = imageUrl(item.image);
  return `<button class="evidence ${cls}" data-photo="${h(src)}" data-caption="${h(alt)}" aria-label="${h(COPY[locale].zoom)}: ${h(alt)}"><img src="${h(src)}" alt="${h(alt)}" loading="lazy"/><span class="zoom-hint">${h(COPY[locale].zoom)} ↗</span></button>`;
};
const fold = (title, text) =>
  text
    ? `<details class="field-fold"><summary>${h(title)} <span>＋</span></summary><p>${h(text)}</p></details>`
    : "";

function choices(items, scope, selected, locale, cls = "choice-strip") {
  const label = scope === "item" ? COPY[locale].chooseItem : COPY[locale].chooseChapter;
  return `<div class="${cls}" aria-label="${h(label)}">${items.map((item, index) => `<button data-pick="${scope}" data-index="${index}" aria-pressed="${index === selected}">${item}</button>`).join("")}</div>`;
}

export function mountExhibit(host, id, locale = "en") {
  const module = categories.find((category) => category.id === id);
  if (!module) return;
  current = { host, id, locale };
  const copy = COPY[locale];
  const name = field(module, "name", locale);
  if (!module.items.length) {
    host.innerHTML = `<article class="award-card story-enter"><h3>${h(copy.empty)}</h3></article>`;
    return;
  }
  if (!states.has(id)) states.set(id, { item: 0, chapter: 0 });
  const state = states.get(id);
  const item = module.items[state.item];
  const chapters = item.chapters || [];
  let view = "";
  const intro = `${metrics(field(module, "metrics", locale), locale)}<div class="account-links">${links(field(module, "links", locale), locale)}</div>`;

  if (module.kind === "gallery") {
    view = choices(
      module.items.map((entry, index) => `${String(index + 1).padStart(2, "0")} · ${h(field(entry, "title", locale))}`),
      "item",
      state.item,
      locale,
    );
    view += `<article class="screening story-enter text-only"><div class="screening-copy"><span class="tiny-label">${h(field(item, "kicker", locale))}</span><h3>${h(field(item, "title", locale))}</h3><p>${h(field(item, "summary", locale))}</p>${metrics(field(item, "metrics", locale), locale)}${links(field(item, "links", locale), locale)}</div></article>`;
    if (module.timeline?.length) {
      view += `<details class="career-fold"><summary>${h(copy.careerTimeline)} ＋</summary><div class="career-timeline">${module.timeline.map((entry) => `<article><small>${h(field(entry, "period", locale))}</small><h4>${h(field(entry, "title", locale))}</h4><p>${h(field(entry, "text", locale))}</p></article>`).join("")}</div></details>`;
    }
  } else {
    if (module.timeline?.length) {
      view = `<details class="career-fold"><summary>${h(copy.careerTimeline)} ＋</summary><div class="career-timeline">${module.timeline.map((entry) => `<article><small>${h(field(entry, "period", locale))}</small><h4>${h(field(entry, "title", locale))}</h4><p>${h(field(entry, "text", locale))}</p></article>`).join("")}</div></details>`;
    }
    if (module.items.length > 1) {
      view += choices(module.items.map((entry) => h(field(entry, "title", locale))), "item", state.item, locale);
    }
    view += `<div class="${module.kind === "research" ? "journal-cover" : "project-cover"}"><div><span class="tiny-label">${h(field(item, "kicker", locale))}</span><h3>${h(field(item, "title", locale))}</h3><p>${h(field(item, "summary", locale))}</p>${metrics(field(item, "metrics", locale), locale)}</div></div>`;
    view += choices(
      chapters.map((chapter, index) => `<b>${String(index + 1).padStart(2, "0")}</b>${h(field(chapter, "title", locale))}`),
      "chapter",
      state.chapter,
      locale,
      "step-path",
    );
    if (chapters.length) {
      const chapter = chapters[state.chapter];
      const isLast = state.chapter === chapters.length - 1;
      view += `<article class="${module.kind === "research" ? "research-leaf" : "case-step"} story-enter"><span class="tiny-label">${h(copy.chapter)} ${state.chapter + 1} / ${chapters.length}</span><h3>${h(field(chapter, "title", locale))}</h3><p>${h(field(chapter, "text", locale))}</p></article><div class="case-footer"><span>${state.chapter + 1} / ${chapters.length}</span>${!isLast ? `<button data-next>${h(copy.next)} →</button>` : `<span>✓ ${h(copy.finished)}</span>`}</div>`;
    }
    view += `${picture(item, "award-photo", locale)}<div class="paper-links">${links(field(item, "links", locale), locale)}</div>`;
  }

  const reflection = field(item, "reflection", locale);
  const note = field(item, "sourceNote", locale);
  const contactLinks = links(field(profile, "links", locale), locale);
  host.innerHTML =
    intro +
    view +
    fold(copy.reflection, reflection) +
    (note ? `<p class="source-note">${h(note)}</p>` : "") +
    (contactLinks ? `<div class="conversation-card"><b>${h(locale === "zh" ? `继续了解${profile.nameZh || profile.name}` : `More about ${profile.name}`)}</b><div class="project-contact-links">${contactLinks}</div></div>` : "");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pick]");
  if (button && current) {
    const state = states.get(current.id);
    const scope = button.dataset.pick;
    state[scope] = Number(button.dataset.index);
    if (scope === "item") state.chapter = 0;
    const scrollTop = document.getElementById("work").scrollTop;
    mountExhibit(current.host, current.id, current.locale);
    current.host.querySelector(`[data-pick="${scope}"][data-index="${state[scope]}"]`)?.focus({ preventScroll: true });
    document.getElementById("work").scrollTop = scrollTop;
  }
  if (event.target.closest("[data-next]") && current) {
    const state = states.get(current.id);
    state.chapter++;
    mountExhibit(current.host, current.id, current.locale);
    current.host.querySelector(`[data-pick="chapter"][data-index="${state.chapter}"]`)?.focus({ preventScroll: true });
  }
  const photo = event.target.closest("[data-photo]");
  if (photo) {
    const dialog = document.getElementById("evidence-dialog");
    dialog.querySelector("img").src = photo.dataset.photo;
    dialog.querySelector("img").alt = photo.dataset.caption;
    dialog.querySelector("p").textContent = photo.dataset.caption;
    dialog.showModal();
  }
});

const evidence = document.getElementById("evidence-dialog");
document.getElementById("close-evidence").addEventListener("click", () => evidence.close());
evidence.addEventListener("click", (event) => {
  if (event.target === evidence) evidence.close();
});
evidence.addEventListener("keydown", (event) => {
  if (event.key === "Escape") event.stopPropagation();
});
