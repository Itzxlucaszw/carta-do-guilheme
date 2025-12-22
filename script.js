const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');

let currentIndex = 0;
const total = images.length;

function updateSlide() {
  if (!slides) return;
  slides.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// Slideshow automático
setInterval(() => {
  currentIndex = (currentIndex + 1) % total;
  updateSlide();
}, 5000);
