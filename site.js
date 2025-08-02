document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (header) {
    const threshold = 50;
    const onScroll = () => {
      if (window.scrollY > threshold) {
        header.classList.add('collapsed');
      } else {
        header.classList.remove('collapsed');
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Make headings collapsible
  const main = document.querySelector('main');
  if (main) {
    const headings = main.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      const section = [];
      let el = heading.nextElementSibling;
      while (el && !(el.tagName.match(/^H[1-6]$/) && parseInt(el.tagName.substring(1)) <= level)) {
        section.push(el);
        el = el.nextElementSibling;
      }
      if (section.length) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('collapsible-content');
        section.forEach((node) => wrapper.appendChild(node));
        heading.insertAdjacentElement('afterend', wrapper);
        heading.classList.add('collapsible');
        heading.addEventListener('click', () => {
          const hidden = wrapper.style.display === 'none';
          wrapper.style.display = hidden ? '' : 'none';
          heading.classList.toggle('collapsed', !hidden);
        });
      }
    });
  }
});
