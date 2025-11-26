// Extracted from admin_user_management.html
async function fetchJSON(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadUsers() {
  const userList = document.getElementById('userList');
  userList.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const [students, faculties] = await Promise.all([
      fetch('/students').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/faculties').then(r=>r.ok?r.json():[]).catch(()=>[])
    ]);

    const combined = [];
    students.forEach(s => combined.push({ id: s.student_id, name: s.full_name, email: s.email, role: 'Student' }));
    faculties.forEach(f => combined.push({ id: f.faculty_id, name: f.name, email: f.email, role: 'Faculty' }));

    if (combined.length === 0) {
      userList.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
      return;
    }

    userList.innerHTML = '';
    combined.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button class="btn" onclick="editUser('${user.role}', ${user.id})">Edit</button>
          <button class="btn danger" onclick="deleteUser('${user.role}', ${user.id})">Delete</button>
        </td>
      `;
      userList.appendChild(row);
    });
  } catch (err) {
    userList.innerHTML = '<tr><td colspan="5">Failed to load users.</td></tr>';
    console.error(err);
  }
}

function promptFields(fields, defaults={}){
  const out = {};
  for (const f of fields){
    const val = prompt(`Enter ${f}`, defaults[f] ?? '');
    if (val === null) return null;
    out[f] = val;
  }
  return out;
}

async function addUser(){
  const role = prompt('Role for new user (Student / Faculty)')?.trim();
  if (!role) return;
  if (role.toLowerCase() === 'student'){
    const vals = promptFields(['full_name','email','password']);
    if (!vals) return;
    try{
      await fetch('/students', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(vals)});
      window.createNotification?.({ message: `New student registered: ${vals.full_name}`, recipient_id: null });
      await loadUsers();
    }catch(e){ console.error(e); window.showToast?.('Failed to add student','error'); }
  } else if (role.toLowerCase() === 'faculty'){
    const vals = promptFields(['name','email','password']);
    if (!vals) return;
    try{
      await fetch('/faculties', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(vals)});
      window.createNotification?.({ message: `New faculty added: ${vals.name}`, recipient_id: null });
      await loadUsers();
    }catch(e){ console.error(e); window.showToast?.('Failed to add faculty','error'); }
  } else {
    alert('Role must be Student or Faculty');
  }
}

async function editUser(role, id){
  try{
    if (role === 'Student'){
      const current = await fetchJSON(`/students/${id}`);
      const vals = promptFields(['full_name','email','password'], current);
      if (!vals) return;
      await fetch(`/students/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(vals)});
      window.showToast?.('Student updated','success');
    } else {
      const current = await fetchJSON(`/faculties/${id}`);
      const vals = promptFields(['name','email','password'], current);
      if (!vals) return;
      await fetch(`/faculties/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(vals)});
      window.showToast?.('Faculty updated','success');
    }
    await loadUsers();
  }catch(e){ console.error(e); window.showToast?.('Update failed','error'); }
}

async function deleteUser(role, id){
  if (!confirm('Are you sure you want to delete this user?')) return;
  try{
    if (role === 'Student') await fetch(`/students/${id}`,{ method: 'DELETE' });
    else await fetch(`/faculties/${id}`,{ method: 'DELETE' });
    window.showToast?.('User deleted','info');
    await loadUsers();
  }catch(e){ console.error(e); window.showToast?.('Delete failed','error'); }
}

window.addUser = addUser;
window.editUser = editUser;
window.deleteUser = deleteUser;

window.addEventListener('DOMContentLoaded', loadUsers);
