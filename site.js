function initCollapsibleHeadings() {
  const main = document.querySelector("main, #content");
  if (main) {
    const headings = main.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => {
      if (heading.classList.contains("collapsible")) return;
      const level = parseInt(heading.tagName.substring(1));
      const section = [];
      let el = heading.nextElementSibling;
      while (
        el &&
        !(
          el.tagName.match(/^H[1-6]$/) &&
          parseInt(el.tagName.substring(1)) <= level
        )
      ) {
        section.push(el);
        el = el.nextElementSibling;
      }
      if (section.length) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("collapsible-content");
        section.forEach((node) => wrapper.appendChild(node));
        heading.insertAdjacentElement("afterend", wrapper);
        heading.classList.add("collapsible");

        const icon = document.createElement("span");
        icon.classList.add("collapse-icon");
        icon.textContent = "\u25BE";
        heading.insertBefore(icon, heading.firstChild);

        const toggle = () => {
          const hidden = wrapper.style.display === "none";
          wrapper.style.display = hidden ? "" : "none";
          heading.classList.toggle("collapsed", !hidden);
          icon.textContent = hidden ? "\u25BE" : "\u25B8";
        };

        icon.addEventListener("click", (e) => {
          e.stopPropagation();
          toggle();
        });
        heading.addEventListener("click", toggle);
      }
    });
  }
}

function adjustH3HeadingColors() {
  document.querySelectorAll("h2").forEach((h2) => {
    const baseColor = getComputedStyle(h2).color;
    const { h, s, l } = rgbToHsl(baseColor);
    let el = h2.nextElementSibling;
    let index = 0;
    while (el && !el.tagName.match(/^H[12]$/)) {
      if (el.tagName === "H3") {
        const saturation = Math.max(0, s - index * 10);
        el.style.color = `hsl(${h}, ${saturation}%, ${l}%)`;
        index++;
      }
      el = el.nextElementSibling;
    }
  });
}

function rgbToHsl(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return { h: 0, s: 0, l: 0 };
  let r = m[1] / 255,
    g = m[2] / 255,
    b = m[3] / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function syncBoldTextColors() {
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    const color = getComputedStyle(heading).color;
    heading.querySelectorAll("strong, b").forEach((el) => {
      el.style.color = color;
    });
    let el = heading.nextElementSibling;
    while (el && !el.tagName.match(/^H[1-6]$/)) {
      if (!el.closest("#contributors")) {
        el.querySelectorAll("strong, b").forEach((bold) => {
          bold.style.color = color;
        });
      }
      el = el.nextElementSibling;
    }
  });
}

function applySparkleEffect() {
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    const color = getComputedStyle(heading).color;
    heading.querySelectorAll("strong, b").forEach((el) => {
      el.classList.add("sparkle");
      el.style.setProperty("--sparkle-color", color);
    });
    let el = heading.nextElementSibling;
    while (el && !el.tagName.match(/^H[1-6]$/)) {
      el.querySelectorAll("strong, b").forEach((bold) => {
        bold.classList.add("sparkle");
        bold.style.setProperty("--sparkle-color", color);
        if (bold.closest("#contributors")) {
          bold.style.color = color;
        }
      });
      el = el.nextElementSibling;
    }
  });
}

function removeSparkleEffect() {
  document.querySelectorAll(".sparkle").forEach((el) => {
    el.classList.remove("sparkle");
    el.style.removeProperty("--sparkle-color");
    if (el.closest("#contributors")) {
      el.style.removeProperty("color");
    }
    el.classList.remove("pazzaz");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  if (header) {
    const threshold = 50;
    const onScroll = () => {
      if (window.scrollY > threshold) {
        header.classList.add("collapsed");
      } else {
        header.classList.remove("collapsed");
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  initCollapsibleHeadings();

  adjustH3HeadingColors();
  syncBoldTextColors();

  let sparkleEnabled = false;
  const sparkleToggle = document.getElementById("sparkle-toggle");
  if (sparkleToggle) {
    let prev = sparkleToggle.previousElementSibling;
    while (prev && !prev.tagName.match(/^H[1-6]$/)) {
      prev = prev.previousElementSibling;
    }
    if (prev) {
      const color = getComputedStyle(prev).color;
      sparkleToggle.style.color = color;
    }
    sparkleToggle.addEventListener("click", () => {
      sparkleEnabled = !sparkleEnabled;
      if (sparkleEnabled) {
        applySparkleEffect();
        sparkleToggle.textContent = "✨ Disable sparkle ✨";
        sparkleToggle.classList.add("pazzaz");
      } else {
        removeSparkleEffect();
        sparkleToggle.textContent = "✨ Enable sparkle ✨";
        sparkleToggle.classList.remove("pazzaz");
      }
    });
  }

  const collapseToggle = document.getElementById("collapse-toggle");
  if (collapseToggle) {
    let allCollapsed = false;
    collapseToggle.addEventListener("click", () => {
      const headings = document.querySelectorAll(
        "h1.collapsible, h2.collapsible, h3.collapsible, h4.collapsible, h5.collapsible, h6.collapsible",
      );
      headings.forEach((heading) => {
        const content = heading.nextElementSibling;
        const icon = heading.querySelector(".collapse-icon");
        if (!content || !content.classList.contains("collapsible-content"))
          return;
        if (!allCollapsed) {
          content.style.display = "none";
          heading.classList.add("collapsed");
          if (icon) icon.textContent = "\u25B8";
        } else {
          content.style.display = "";
          heading.classList.remove("collapsed");
          if (icon) icon.textContent = "\u25BE";
        }
      });
      allCollapsed = !allCollapsed;
      collapseToggle.textContent = allCollapsed ? "+" : "\u2212";
      collapseToggle.title = allCollapsed ? "Expand all" : "Collapse all";
    });
  }
});
