const STORAGE_KEY = 'leads';

const form = document.getElementById('lead-form');
const companyInput = document.getElementById('company');
const websiteInput = document.getElementById('website');
const segmentInput = document.getElementById('segment');
const sourceInput = document.getElementById('source');
const statusInput = document.getElementById('research-status');
const notesInput = document.getElementById('notes');
const newLeadBtn = document.getElementById('new-lead-btn');
const cancelBtn = document.getElementById('cancel-btn');
const list = document.getElementById('lead-list');
const emptyState = document.getElementById('empty-state');

let leads = loadLeads();
let editingId = null;
const openIds = new Set();

function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function showForm(lead) {
  editingId = lead ? lead.id : null;
  companyInput.value = lead ? lead.company : '';
  websiteInput.value = lead ? lead.website : '';
  segmentInput.value = lead ? lead.segment : '';
  sourceInput.value = lead ? lead.source : '';
  statusInput.value = lead ? lead.researchStatus : 'Not Started';
  notesInput.value = lead ? lead.notes : '';
  form.classList.remove('hidden');
  companyInput.focus();
}

function hideForm() {
  form.reset();
  editingId = null;
  form.classList.add('hidden');
}

newLeadBtn.addEventListener('click', () => showForm(null));
cancelBtn.addEventListener('click', hideForm);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const company = companyInput.value.trim();
  if (!company) return;

  const fields = {
    company,
    website: websiteInput.value.trim(),
    segment: segmentInput.value.trim(),
    source: sourceInput.value.trim(),
    researchStatus: statusInput.value,
    notes: notesInput.value.trim(),
  };

  if (editingId) {
    const lead = leads.find((l) => l.id === editingId);
    Object.assign(lead, fields);
  } else {
    leads.push({ id: Date.now().toString(), ...fields });
  }

  saveLeads();
  hideForm();
  render();
});

list.addEventListener('click', (e) => {
  const card = e.target.closest('.lead-card');
  if (!card) return;
  const id = card.dataset.id;

  if (e.target.matches('[data-action="open"]')) {
    if (openIds.has(id)) {
      openIds.delete(id);
    } else {
      openIds.add(id);
    }
    render();
  } else if (e.target.matches('[data-action="edit"]')) {
    const lead = leads.find((l) => l.id === id);
    showForm(lead);
  } else if (e.target.matches('[data-action="delete"]')) {
    if (confirm('Delete this lead?')) {
      leads = leads.filter((l) => l.id !== id);
      openIds.delete(id);
      if (editingId === id) hideForm();
      saveLeads();
      render();
    }
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function render() {
  list.innerHTML = '';
  emptyState.classList.toggle('hidden', leads.length > 0);

  leads.forEach((lead) => {
    const isOpen = openIds.has(lead.id);
    const li = document.createElement('li');
    li.className = 'lead-card';
    li.dataset.id = lead.id;

    const preview = lead.notes
      ? (lead.notes.length > 80 ? lead.notes.slice(0, 80) + '…' : lead.notes)
      : 'No notes';

    const meta = [lead.segment, lead.source, lead.researchStatus]
      .filter(Boolean)
      .map(escapeHtml)
      .join(' · ');

    const websiteRow = lead.website
      ? `<dt>Website</dt><dd><a href="${escapeHtml(lead.website)}" target="_blank" rel="noopener">${escapeHtml(lead.website)}</a></dd>`
      : '';

    li.innerHTML = `
      <div class="lead-card-header">
        <div>
          <div class="lead-card-title">${escapeHtml(lead.company)}</div>
          ${meta ? `<div class="lead-card-meta">${meta}</div>` : ''}
          ${!isOpen ? `<div class="lead-card-preview">${escapeHtml(preview)}</div>` : ''}
        </div>
        <div class="lead-card-actions">
          <button type="button" class="btn btn-secondary" data-action="open">${isOpen ? 'Close' : 'Open'}</button>
          <button type="button" class="btn btn-secondary" data-action="edit">Edit</button>
          <button type="button" class="btn btn-danger" data-action="delete">Delete</button>
        </div>
      </div>
      ${isOpen ? `
        <div class="lead-card-full">
          <dl>
            ${websiteRow}
            <dt>Segment</dt><dd>${escapeHtml(lead.segment) || '—'}</dd>
            <dt>Source</dt><dd>${escapeHtml(lead.source) || '—'}</dd>
            <dt>Research Status</dt><dd>${escapeHtml(lead.researchStatus) || '—'}</dd>
            <dt>Notes</dt>
            <dd class="notes-block">${escapeHtml(lead.notes) || '—'}</dd>
          </dl>
        </div>
      ` : ''}
    `;

    list.appendChild(li);
  });
}

render();
