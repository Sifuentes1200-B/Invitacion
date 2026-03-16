const thanksCountdown = document.getElementById('thanksCountdown');
const thanksLead = document.getElementById('thanksLead');
const thanksMessageBox = document.getElementById('thanksMessageBox');
const dbMessage = document.getElementById('dbMessage');

const targetDate = new Date('2026-05-16T15:00:00');

function renderThanksCountdown() {
  if (!thanksCountdown) return;

  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    thanksCountdown.innerHTML = '<p>¡Llegó el gran día!</p>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  thanksCountdown.innerHTML = `
    <div class="countdown-item"><strong>${days}</strong><span>días</span></div>
    <div class="countdown-item"><strong>${hours}</strong><span>horas</span></div>
    <div class="countdown-item"><strong>${minutes}</strong><span>minutos</span></div>
    <div class="countdown-item"><strong>${seconds}</strong><span>segundos</span></div>
  `;
}

function renderThankYouContent() {
  const savedData = sessionStorage.getItem('confirmacionBoda');

  if (!savedData) {
    if (thanksLead) {
      thanksLead.textContent =
        'Hemos recibido tu respuesta. Nos llena de emoción compartir contigo este momento tan especial.';
    }
    return;
  }

  const data = JSON.parse(savedData);
  const asistencia = data.asistencia;
  const mensaje = data.mensaje?.trim();

  if (thanksLead) {
    thanksLead.textContent =
      asistencia === 'si'
        ? 'Gracias por confirmar tu asistencia. Nos honra profundamente contar con tu presencia en un día tan significativo para nosotros, y queremos aprovechar este momento para expresarte unas palabras muy especiales:'
        : 'Lamentamos de corazón que no puedas acompañarnos en esta ocasión. Aun así, valoramos sinceramente tu honestidad y queremos dedicarte unas palabras con todo nuestro cariño:';
  }

  if (mensaje && thanksMessageBox && dbMessage) {
    thanksMessageBox.classList.remove('hidden');
    dbMessage.textContent = mensaje;
  }
}

renderThankYouContent();
renderThanksCountdown();
setInterval(renderThanksCountdown, 1000);