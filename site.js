document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;
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
});
