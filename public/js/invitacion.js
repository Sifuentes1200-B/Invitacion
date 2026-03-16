const playButton = document.getElementById('playButton');
const weddingSong = document.getElementById('weddingSong');
const countdown = document.getElementById('countdown');

playButton?.addEventListener('click', async () => {
  if (!weddingSong) return;

  if (weddingSong.paused) {
    await weddingSong.play();
    playButton.textContent = '❚❚';
  } else {
    weddingSong.pause();
    playButton.textContent = '▶';
  }
});

const targetDate = new Date('2026-05-16T15:00:00');

function renderCountdown() {
  if (!countdown) return;

  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    countdown.innerHTML = '<p>¡Llegó el gran día!</p>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdown.innerHTML = `
    <div class="countdown-item"><strong>${days}</strong><span>días</span></div>
    <div class="countdown-item"><strong>${hours}</strong><span>horas</span></div>
    <div class="countdown-item"><strong>${minutes}</strong><span>minutos</span></div>
    <div class="countdown-item"><strong>${seconds}</strong><span>segundos</span></div>
  `;
}

renderCountdown();
setInterval(renderCountdown, 1000);
