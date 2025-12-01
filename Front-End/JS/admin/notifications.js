// Admin notifications behavior (extracted from inline)
async function populateNotifications(){
  const tbody = document.getElementById('notificationList');
  try{
    const res = await fetch('/notifications');
    const list = await res.json();
    tbody.innerHTML = '';
    list.forEach(n=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${n.notification_id}</td>
        <td>${n.type || ''}</td>
        <td>${n.message}</td>
        <td>${n.recipient_id || 'All'}</td>
        <td>
          <button class="action-btn btn-delete" data-id="${n.notification_id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.btn-delete').forEach(b=> b.addEventListener('click', async e=>{
      const id = e.target.dataset.id;
      if(!confirm('Delete notification?')) return;
      await fetch(`/notifications/${id}`,{ method:'DELETE' });
      populateNotifications();
    }));
  }catch(err){
    console.error('Failed to load notifications', err);
    tbody.innerHTML = '<tr><td colspan="5">Failed to load</td></tr>';
  }
}

async function addNotification(){
  const title = document.getElementById('titleInput').value.trim();
  const message = document.getElementById('messageInput').value.trim();
  const category = document.getElementById('categoryInput').value;
  const target = document.getElementById('targetInput').value;
  if(!message || !category || !target){ showAlert('Please fill required fields', 'warning'); return; }
  const payload = { message, type: category, recipient_id: target === 'All' ? null : (target === 'Students' ? 0 : -1) };
  const r = await fetch('/notifications',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if(r.ok){ showAlert('Added','success'); populateNotifications(); }
  else showAlert('Failed to add','error');
}

window.addEventListener('load', populateNotifications);
window.addNotification = addNotification;
