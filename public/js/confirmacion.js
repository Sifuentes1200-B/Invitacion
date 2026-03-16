const codeForm = document.getElementById('codeForm');
const inviteCodeInput = document.getElementById('inviteCode');
const formMessage = document.getElementById('formMessage');
const guestInfo = document.getElementById('guestInfo');

let currentGuestData = null;

function renderGuestCard(data) {
  currentGuestData = data;

  guestInfo.classList.remove('hidden');
  guestInfo.innerHTML = `
    <h2>Datos de la invitación</h2>
    <p><strong>Titular:</strong> ${data.titular}</p>
    <p><strong>Confirmado:</strong> ${data.confirmado === 1 ? 'Sí' : 'No'}</p>
    <p><strong>Número de pases:</strong> ${data.numero_pases}</p>

    <form id="confirmationForm" class="confirm-grid">
      <label>
        ¿Asistirás?
        <select name="asistencia" required>
          <option value="">Selecciona una opción</option>
          <option value="si">Sí, confirmo asistencia</option>
          <option value="no">No podré asistir</option>
        </select>
      </label>

      <button type="submit" class="primary-btn">Guardar confirmación</button>
    </form>
  `;

  const confirmationForm = document.getElementById('confirmationForm');

  confirmationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(confirmationForm);
    const asistencia = formData.get('asistencia');

    try {
      const response = await fetch(`/api/confirm/${inviteCodeInput.value.trim().toUpperCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ asistencia })
      });

      const result = await response.json();

      if (!response.ok) {
        formMessage.textContent = result.message;
        return;
      }

      sessionStorage.setItem('confirmacionBoda', JSON.stringify({
        titular: currentGuestData?.titular ?? '',
        numero_pases: currentGuestData?.numero_pases ?? 0,
        mensaje: currentGuestData?.mensaje ?? '',
        asistencia
      }));

      window.location.href = './gracias.html';
    } catch (error) {
      formMessage.textContent = 'No fue posible enviar tu confirmación.';
    }
  });
}

codeForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Consultando invitación...';
  guestInfo.classList.add('hidden');

  const code = inviteCodeInput.value.trim().toUpperCase();

  try {
    const response = await fetch(`/api/guest/${code}`);
    const result = await response.json();

    if (!response.ok) {
      formMessage.textContent = result.message;
      return;
    }

    formMessage.textContent = 'Invitación encontrada.';
    renderGuestCard(result.data);
  } catch (error) {
    formMessage.textContent = 'No fue posible consultar tu código.';
  }
});