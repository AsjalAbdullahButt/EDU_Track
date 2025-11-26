// Populate admin dashboard stats and notifications
async function updateStats(){
  try{
    const [students, faculties, fees, notifications] = await Promise.all([
      fetch('/students').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/faculties').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/fees').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/notifications').then(r=>r.ok?r.json():[]).catch(()=>[])
    ]);

    document.getElementById('studentsCount').textContent = students.length || 0;
    document.getElementById('facultyCount').textContent = faculties.length || 0;

    let total = 0, paid = 0;
    fees.forEach(f=>{ total += Number(f.total_amount||0); paid += Number(f.amount_paid||0); });
    const percent = total > 0 ? Math.round((paid/total)*100) : 0;
    document.getElementById('feeCollection').textContent = percent + '%';

    const adminList = document.getElementById('adminNotificationList');
    adminList.innerHTML = notifications.slice(0,6).map(n=>`<li>${new Date(n.date_sent).toLocaleString()} — ${n.message}</li>`).join('') || '<li>No notifications</li>';

    document.getElementById('pendingRequestsCount').textContent = notifications.length || 0;
  }catch(e){ console.warn('Failed to update admin stats', e); }
}

document.addEventListener('DOMContentLoaded', updateStats);
