// Main app logic for event manager.
const STORAGE = 'Ai_events_v1';
let events = (typeof getFromLocalStorage === 'function' ? getFromLocalStorage(STORAGE) : null) || [];
let editingId = null;

/* DOM refs */
const $ = id => document.getElementById(id);
const eventsWrap = $('events');
const noevents = $('noevents');
const totalCount = $('totalCount');
const showCount = $('showCount');

const openFormBtn = $('openForm');
const saveEventBtn = $('saveEvent');
const resetFormBtn = $('resetForm');
const exportCSVBtn = $('exportCSV');
const clearAllBtn = $('clearAll');

const titleIn = $('title'), dateIn = $('date'), timeIn = $('time'), categoryIn = $('category'), locationIn = $('location'), descriptionIn = $('description');
const searchIn = $('search'), categoryFilter = $('categoryFilter'), dateFilter = $('dateFilter');
const formTitle = $('formTitle');

function uid(){ return Math.random().toString(36).slice(2,9); }
function persist(){ if(typeof saveToLocalStorage === 'function') saveToLocalStorage(STORAGE, events); else localStorage.setItem(STORAGE, JSON.stringify(events)); }

/* Render events */
function render(){
  const q = (searchIn && searchIn.value || '').trim().toLowerCase();
  const cat = (categoryFilter && categoryFilter.value) || 'All';
  const d = (dateFilter && dateFilter.value) || '';

  let filtered = events.filter(ev=>{
    if(cat !== 'All' && ev.category !== cat) return false;
    if(d && ev.date !== d) return false;
    if(q){
      const hay = (ev.title + ' ' + (ev.description||'') + ' ' + (ev.location||'') + ' ' + (ev.category||'')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });

  if(!eventsWrap) return;
  eventsWrap.innerHTML = '';
  if(filtered.length === 0){
    if(noevents) noevents.style.display = 'inline-block';
  } else {
    if(noevents) noevents.style.display = 'none';
  }

  filtered.sort((a,b)=> new Date(a.date) - new Date(b.date)).forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <h3>${escape(ev.title)}</h3>
      <div class="meta">${escape(ev.category)} • ${escape(ev.date)} ${ev.time ? ' • ' + escape(ev.time) : ''}</div>
      <div class="desc">${escape(ev.description || '')}</div>
      <div class="event-footer">
        <div class="tiny">${escape(ev.location || '')}</div>
        <div>
          <button class="small-btn ghost" data-action="manage" data-id="${ev.id}">Manage</button>
          <button class="small-btn ghost" data-action="edit" data-id="${ev.id}">Edit</button>
          <button class="small-btn warn" data-action="delete" data-id="${ev.id}">Delete</button>
        </div>
      </div>
    `;
    eventsWrap.appendChild(div);
  });

  if(totalCount) totalCount.textContent = events.length;
  if(showCount) showCount.textContent = filtered.length;
}

/* helpers */
function escape(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function findEvent(id){ return events.find(e => e.id === id); }

/* open form */
if(openFormBtn) openFormBtn.addEventListener('click', ()=>{
  editingId = null;
  if(formTitle) formTitle.textContent = 'Create Event';
  if(titleIn) titleIn.value=''; if(dateIn) dateIn.value=''; if(timeIn) timeIn.value=''; if(categoryIn) categoryIn.value = 'General'; if(locationIn) locationIn.value=''; if(descriptionIn) descriptionIn.value='';
  window.scrollTo({top: document.querySelector('body').offsetTop, behavior:'smooth'});
});

/* save event */
if(saveEventBtn) saveEventBtn.addEventListener('click', ()=>{
  const t = titleIn.value.trim();
  const d = dateIn.value;
  if(!t || !d){ alert('Please provide at least a title and date.'); return; }

  if(editingId){
    const ev = findEvent(editingId);
    if(ev){
      ev.title = t; ev.date = d; ev.time = timeIn.value; ev.category = categoryIn.value; ev.location = locationIn.value; ev.description = descriptionIn.value;
    }
    editingId = null;
    if(formTitle) formTitle.textContent = 'Create Event';
  } else {
    const newEv = { id: uid(), title: t, date: d, time: timeIn.value, category: categoryIn.value, location: locationIn.value, description: descriptionIn.value, attendees: [] };
    events.push(newEv);
  }
  persist(); render();
});

/* reset form */
if(resetFormBtn) resetFormBtn.addEventListener('click', ()=>{
  if(titleIn) titleIn.value=''; if(dateIn) dateIn.value=''; if(timeIn) timeIn.value=''; if(categoryIn) categoryIn.value = 'General'; if(locationIn) locationIn.value=''; if(descriptionIn) descriptionIn.value='';
  editingId = null; if(formTitle) formTitle.textContent = 'Create Event';
});

/* delegation for manage/edit/delete */
if(eventsWrap) eventsWrap.addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if(action === 'edit') openEdit(id);
  else if(action === 'delete'){
    if(confirm('Delete this event?')){ events = events.filter(ev=>ev.id!==id); persist(); render(); }
  } else if(action === 'manage') openManageModal(id);
});

/* edit */
function openEdit(id){
  const ev = findEvent(id);
  if(!ev) return;
  editingId = id;
  if(formTitle) formTitle.textContent = 'Edit Event';
  if(titleIn) titleIn.value = ev.title; if(dateIn) dateIn.value = ev.date; if(timeIn) timeIn.value = ev.time || ''; if(categoryIn) categoryIn.value = ev.category || 'General';
  if(locationIn) locationIn.value = ev.location || ''; if(descriptionIn) descriptionIn.value = ev.description || '';
  window.scrollTo({top: document.querySelector('body').offsetTop, behavior:'smooth'});
}

/* manage modal */
function openManageModal(id){
  const ev = findEvent(id);
  if(!ev) return;
  const root = document.getElementById('modalRoot');
  root.innerHTML = '';
  const backdrop = document.createElement('div'); backdrop.className='modal-backdrop';
  const modal = document.createElement('div'); modal.className='modal';

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <h3 style="margin:0">${escape(ev.title)}</h3>
      <div style="color:var(--muted)">${escape(ev.date)} ${ev.time ? ' • ' + escape(ev.time) : ''}</div>
    </div>
    <div style="margin-top:12px">
      <div style="display:flex;gap:8px">
        <input id="attName" class="input" placeholder="Attendee name" />
        <input id="attEmail" class="input" placeholder="Email (optional)" />
        <button id="addAtt" class="btn btn-primary">Add</button>
      </div>
      <div class="att-list" id="attList"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
        <button id="closeModal" class="btn btn-ghost-sm">Close</button>
      </div>
    </div>
  `;

  backdrop.appendChild(modal);
  root.appendChild(backdrop);

  const attList = modal.querySelector('#attList');
  const attName = modal.querySelector('#attName');
  const attEmail = modal.querySelector('#attEmail');
  const addAtt = modal.querySelector('#addAtt');
  const closeModal = modal.querySelector('#closeModal');

  function renderAttendees(){
    attList.innerHTML = '';
    (ev.attendees || []).forEach((a, idx) => {
      const d = document.createElement('div');
      d.className = 'attendee';
      d.innerHTML = `<div><strong>${escape(a.name)}</strong><div class="tiny">${escape(a.email || '')}</div></div>
                     <div><button class="small-btn warn" data-idx="${idx}">Remove</button></div>`;
      attList.appendChild(d);
    });
  }

  addAtt.addEventListener('click', ()=>{
    const name = attName.value.trim();
    const email = attEmail.value.trim();
    if(!name){ alert('Please enter a name'); return; }
    ev.attendees = ev.attendees || [];
    ev.attendees.push({ name, email });
    persist(); renderAttendees(); render();
    attName.value=''; attEmail.value='';
  });

  attList.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const idx = Number(btn.dataset.idx);
    if(Number.isFinite(idx)){
      ev.attendees.splice(idx,1);
      persist(); renderAttendees(); render();
    }
  });

  closeModal.addEventListener('click', ()=>{ root.innerHTML=''; });

  backdrop.addEventListener('click', (evb)=>{ if(evb.target === backdrop) root.innerHTML=''; });

  renderAttendees();
}

/* Search / filter */
[searchIn, categoryFilter, dateFilter].forEach(inp => inp && inp.addEventListener('input', render));

/* Export CSV */
if(exportCSVBtn) exportCSVBtn.addEventListener('click', ()=>{
  if(!events.length){ alert('No events to export'); return; }
  let rows = [['Event ID','Title','Date','Time','Category','Location','Description','Attendee Name','Attendee Email']];
  events.forEach(ev=>{
    if(ev.attendees && ev.attendees.length){
      ev.attendees.forEach(a=>{
        rows.push([ev.id, ev.title, ev.date, ev.time || '', ev.category || '', ev.location || '', ev.description || '', a.name, a.email || '']);
      });
    } else {
      rows.push([ev.id, ev.title, ev.date, ev.time || '', ev.category || '', ev.location || '', ev.description || '', '','']);
    }
  });
  const csv = rows.map(r => r.map(s=>safeCsv(s)).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'ai-events.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

function safeCsv(v){
  if(v == null) return '';
  const s = String(v).replaceAll('"','""');
  return '"' + s + '"';
}

/* Clear */
if(clearAllBtn) clearAllBtn.addEventListener('click', ()=>{
  if(confirm('Clear all events? This cannot be undone.')){ events = []; persist(); render(); }
});

/* init */
render();