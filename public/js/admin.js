const adminGuestForm = document.getElementById('adminGuestForm');
const adminFormMessage = document.getElementById('adminFormMessage');
const adminGuestsTableBody = document.getElementById('adminGuestsTableBody');
const refreshGuestsButton = document.getElementById('refreshGuests');

const statTotal = document.getElementById('statTotal');
const statConfirmed = document.getElementById('statConfirmed');
const statPending = document.getElementById('statPending');

function renderStats(guests) {
  const total = guests.length;
  const confirmed = guests.filter(guest => Number(guest.confirmado) === 1).length;
  const pending = total - confirmed;

  statTotal.textContent = total;
  statConfirmed.textContent = confirmed;
  statPending.textContent = pending;
}

function renderGuestsTable(guests) {
  if (!guests.length) {
    adminGuestsTableBody.innerHTML = `
      <tr>
        <td colspan="5">No hay invitados registrados.</td>
      </tr>
    `;
    renderStats([]);
    return;
  }

  adminGuestsTableBody.innerHTML = guests.map(guest => `
    <tr>
      <td>${guest.codigo}</td>
      <td>${guest.titular}</td>
      <td>${guest.numero_pases}</td>
      <td>${guest.mensaje ?? ''}</td>
      <td>
        <span class="status-badge ${Number(guest.confirmado) === 1 ? 'status-confirmed' : 'status-pending'}">
          ${Number(guest.confirmado) === 1 ? 'Confirmado' : 'Pendiente'}
        </span>
      </td>
    </tr>
  `).join('');

  renderStats(guests);
}

async function loadGuests() {
  adminGuestsTableBody.innerHTML = `
    <tr>
      <td colspan="5">Cargando invitados...</td>
    </tr>
  `;

  try {
    const response = await fetch('/api/admin/guests');
    const result = await response.json();

    if (!response.ok) {
      adminGuestsTableBody.innerHTML = `
        <tr>
          <td colspan="5">${result.message || 'No fue posible cargar la información.'}</td>
        </tr>
      `;
      return;
    }

    renderGuestsTable(result.data);
  } catch (error) {
    adminGuestsTableBody.innerHTML = `
      <tr>
        <td colspan="5">No fue posible cargar la información.</td>
      </tr>
    `;
  }
}

adminGuestForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  adminFormMessage.textContent = 'Registrando invitado...';

  const payload = {
    codigo: document.getElementById('codigo').value.trim().toUpperCase(),
    titular: document.getElementById('titular').value.trim(),
    numero_pases: Number(document.getElementById('numero_pases').value),
    mensaje: document.getElementById('mensaje').value.trim()
  };

  try {
    const response = await fetch('/api/admin/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      adminFormMessage.textContent = result.message || 'No fue posible registrar al invitado.';
      return;
    }

    adminFormMessage.textContent = result.message;
    adminGuestForm.reset();
    document.getElementById('numero_pases').value = 1;

    await loadGuests();
  } catch (error) {
    adminFormMessage.textContent = 'No fue posible registrar al invitado.';
  }
});

refreshGuestsButton?.addEventListener('click', loadGuests);

loadGuests();