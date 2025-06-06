document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value.trim();
  const guestList = document.getElementById('guestList');
  if (!fullName) {
    guestList.innerHTML = `<p>Please enter your full name.</p>`;
    return;
  }
  guestList.innerHTML = `<p>Searching...</p>`;
  const res = await fetch('/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName })
  });
  const guests = await res.json();
  guestList.innerHTML = '';

  if (!guests || guests.length === 0) {
    guestList.innerHTML = `<p>No guests found for "${fullName}".</p>`;
    return;
  }

  guests.forEach((guest, idx) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="d-flex align-items-start mb-3" style="gap:1rem;">
        <div style="min-width:140px;">
          <span class="wedding-font invite-text" style="color:#6a5a44;font-style:italic;font-size:1.1rem; cursor:pointer;"
            data-guest-id="${guest.id}" data-action="update">
            ${guest.name}
          </span>
        </div>
        <div class="guest-info-col invite-text wedding-font" style="color:#6a5a44;font-style:italic;font-size:1rem;">
          <div><strong>Status:</strong> ${guest.rsvp_response ? guest.rsvp_response.charAt(0).toUpperCase() + guest.rsvp_response.slice(1) : 'Pending'}</div>
          <div class="d-flex mt-2" style="gap:0.5rem;">
            ${
              (!guest.rsvp_response || guest.rsvp_response === 'pending')
                ? `
                  <button class="btn btn-success btn-sm invite-text wedding-font"
                    data-guest-id="${guest.id}" data-action="accept"
                    style="background-color: #6a5a44; color: #fff; font-style: italic; font-size: 1rem; border: none;">
                    Accept
                  </button>
                  <button class="btn btn-outline-danger btn-sm invite-text wedding-font"
                    data-guest-id="${guest.id}" data-action="decline"
                    style="font-style: italic; font-size: 1rem;">
                    Decline
                  </button>
                `
                : ''
            }
          </div>
          <div class="mt-2" style="font-size:0.75rem; color:#a08e6f; text-transform:uppercase; letter-spacing:1px;">
            ${
              guest.rsvp_response === 'accepted'
                ? `
                  <div style="margin-bottom:2px;"><strong>Dietary</strong>: <span style="font-weight:normal;">${guest.dietary_requirements || 'None'}</span></div>
                  <div style="margin-bottom:2px;"><strong>Additional Guests</strong>: <span style="font-weight:normal;">${guest.additional_guests || 0}</span></div>
                  <div style="margin-bottom:2px;"><strong>Children Attending</strong>: <span style="font-weight:normal;">${guest.has_children ? 'Yes' : 'No'}</span></div>
                `
                : guest.rsvp_response === 'declined'
                ? `<div><strong>Sorry you can't make it.</strong></div>`
                : `<div><strong>Please RSVP.</strong></div>`
            }
          </div>
          <div class="mt-3">
            <span class="invite-text wedding-font"
              data-guest-id="${guest.id}" data-action="update"
              style="display:inline-block; color:#6a5a44; font-style:italic; font-size:1rem; text-decoration:underline; cursor:pointer;">
              Update RSVP
            </span>
          </div>
        </div>
      </div>
    `;
    guestList.appendChild(div);
  });
});

// Bootstrap modal instance
let rsvpModal;
document.addEventListener('DOMContentLoaded', function () {
  const modalEl = document.getElementById('rsvpModal');
  if (window.bootstrap) {
    rsvpModal = new bootstrap.Modal(modalEl);
  } else {
    rsvpModal = new window.bootstrap.Modal(modalEl);
  }

  // Delegate click for Accept/Decline buttons
  document.getElementById('guestList').addEventListener('click', function (e) {
    if (e.target.dataset.action === 'accept') {
      openRsvp(e.target.dataset.guestId);
    } else if (e.target.dataset.action === 'decline') {
      rsvpDecline(e.target.dataset.guestId);
    } else if (e.target.dataset.action === 'update') {
      openRsvp(e.target.dataset.guestId); // Now works for both name and button
    }
  });

  const acceptedCollapse = document.getElementById('acceptedCollapse');
  if (acceptedCollapse) {
    acceptedCollapse.addEventListener('show.bs.collapse', async function () {
      const acceptedList = document.getElementById('acceptedList');
      const res = await fetch('/accepted-guests');
      const guests = await res.json();
      if (guests.length === 0) {
        acceptedList.innerHTML = `<div class="invite-text wedding-font">No one has accepted yet.</div>`;
      } else {
        acceptedList.innerHTML = `
          <div class="invite-text wedding-font mb-2" style="color:#6a5a44;font-style:italic;">
            <strong>Coming Guests (${guests.length}):</strong><br>
            ${guests.map(g => g.name).join('<br>')}
          </div>
        `;
      }
    });
  }

  const addGuestBtn = document.getElementById('addGuestBtn');
  if (addGuestBtn) {
    addGuestBtn.addEventListener('click', function () {
      const modal = new bootstrap.Modal(document.getElementById('addGuestModal'));
      modal.show();
    });
  }

  const addGuestForm = document.getElementById('addGuestForm');
  if (addGuestForm) {
    addGuestForm.onsubmit = async function (e) {
      e.preventDefault();
      const formData = new FormData(addGuestForm);
      const family_name = formData.get('family_name');
      const names = formData.get('names')
        .split('\n')
        .map(n => n.trim())
        .filter(Boolean);

      if (!family_name || names.length === 0) {
        alert('Please enter a family name and at least one guest.');
        return;
      }

      const res = await fetch('/admin/add-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_name, names })
      });

      if (res.ok) {
        alert('Guests added!');
        addGuestForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('addGuestModal')).hide();
        // Optionally reload guest list here
      } else {
        alert('Error adding guests.');
      }
    };
  }
});

function openRsvp(id) {
  // Show the modal using Bootstrap's API
  rsvpModal.show();
  document.getElementById('rsvpForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      guestId: id,
      response: formData.get('rsvpStatus'), // get value from dropdown
      dietary: formData.get('dietary'),
      additionalCount: parseInt(formData.get('additionalCount')),
      hasKids: formData.get('hasKids') === 'true'
    };

    await fetch('/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    alert('Thank you for your RSVP!');
    e.target.reset();
    rsvpModal.hide();
  };
}

async function rsvpDecline(id) {
  await fetch('/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId: id, response: 'declined', dietary: '', additionalCount: 0, hasKids: false })
  });
  alert('We’re sorry to miss you!');
}

async function loadDietaryRequirements() {
  const res = await fetch('/dietary-requirements');
  const options = await res.json();
  const select = document.querySelector('select[name="dietary"]');
  if (select) {
    select.innerHTML =
      `<option value="">Select</option>` +
      options.map(opt =>
        `<option value="${opt.name}">${opt.name}</option>`
      ).join('');
  }
}
document.addEventListener('DOMContentLoaded', loadDietaryRequirements);