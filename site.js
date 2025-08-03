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
      });
      el = el.nextElementSibling;
    }
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
  applySparkleEffect();

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
