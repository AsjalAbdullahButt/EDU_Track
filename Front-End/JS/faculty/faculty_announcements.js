/* Faculty Announcements JS */

async function loadAnnouncements() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    console.error('No faculty ID found in session');
    return;
  }

  console.log('Loading announcements for faculty ID:', facultyId);

  try {
    const url = 'http://127.0.0.1:8000/notifications/';
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch notifications:', response.status);
      return;
    }

    const allNotifications = await response.json();
    console.log('All notifications:', allNotifications);
    
    // Filter announcements created by this faculty
    const announcements = (allNotifications || [])
      .filter(n => n.sender_id === facultyId && n.type === 'announcement')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log('Faculty announcements:', announcements);

    const container = document.getElementById('announcementList');
    if (!container) {
      console.error('Announcement list container not found');
      return;
    }

    if (announcements.length === 0) {
      container.innerHTML = '<div class="empty-state">No announcements posted yet. Create your first announcement above!</div>';
      return;
    }

    container.innerHTML = announcements.map(a => `
      <div class="announcement-card">
        <div class="announcement-header">
          <h3>${a.title}</h3>
          <button class="btn-delete" onclick="deleteAnnouncement(${a.notification_id})">
            <span>🗑️</span> Delete
          </button>
        </div>
        <p class="announcement-message">${a.message}</p>
        <div class="announcement-footer">
          <small>Posted: ${new Date(a.created_at).toLocaleString()}</small>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

async function addAnnouncement() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    alert('Not logged in. Please refresh and log in again.');
    return;
  }

  const title = document.getElementById('announcementTitle').value.trim();
  const message = document.getElementById('announcementMessage').value.trim();

  if (!title) {
    alert('Please enter a title');
    return;
  }

  if (!message) {
    alert('Please enter a message');
    return;
  }

  console.log('Creating announcement with faculty ID:', facultyId);

  try {
    const newAnnouncement = {
      sender_id: facultyId,
      recipient_id: null,
      student_id: null,
      title: title,
      message: message,
      type: 'announcement',
      is_read: false
    };

    console.log('Sending announcement data:', newAnnouncement);

    const url = 'http://127.0.0.1:8000/notifications/';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newAnnouncement)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      alert('Failed to post announcement: ' + errorText);
      return;
    }

    const result = await response.json();
    console.log('Success! Result:', result);

    alert('Announcement posted successfully!');
    
    // Clear form
    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementMessage').value = '';
    
    // Reload announcements
    loadAnnouncements();

  } catch (error) {
    console.error('Error posting announcement:', error);
    alert('Error posting announcement: ' + error.message);
  }
}

async function deleteAnnouncement(notificationId) {
  if (!confirm('Are you sure you want to delete this announcement?')) {
    return;
  }

  try {
    const url = `http://127.0.0.1:8000/notifications/${notificationId}`;
    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete failed:', errorText);
      alert('Failed to delete announcement');
      return;
    }

    alert('Announcement deleted successfully!');
    loadAnnouncements();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    alert('Error deleting announcement: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  // Add event listener to post button
  const postBtn = document.getElementById('postAnnouncementBtn');
  if (postBtn) {
    postBtn.addEventListener('click', addAnnouncement);
  }
  
  loadAnnouncements();
});
