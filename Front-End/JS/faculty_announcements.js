// behavior for posting and deleting announcements
function addAnnouncement() {
  const input = document.getElementById('announcementInput');
  const text = input.value && input.value.trim();
  if(!text) return showAlert('Please enter an announcement', 'warning');
  const ul = document.getElementById('announcementList');
  const li = document.createElement('li');
  li.textContent = text;
  const btn = document.createElement('button');
  btn.className = 'delete-btn';
  btn.textContent = 'Delete';
  btn.addEventListener('click', () => deleteAnnouncement(btn));
  li.appendChild(btn);
  ul.prepend(li);
  input.value = '';
}

function deleteAnnouncement(btn) {
  const li = btn.closest('li');
  if(!li) return;
  li.remove();
}

window.addAnnouncement = addAnnouncement;
window.deleteAnnouncement = deleteAnnouncement;

document.addEventListener('DOMContentLoaded', ()=>{
  const input = document.getElementById('announcementInput');
  if(input) input.classList.add('announcement-input');
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(b=> b.addEventListener('click', ()=> deleteAnnouncement(b)));
});
