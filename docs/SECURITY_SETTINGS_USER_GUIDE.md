# Security Settings Page - Quick Reference Guide

## 🔍 How to Use the Security Settings Page

### Accessing the Page
1. Login as Admin
2. Navigate to Dashboard > Security Settings
3. URL: `http://127.0.0.1:8000/pages/dashboard/admin/admin_security.html`

---

## 📊 Dashboard Statistics (Top Cards)

The page displays 4 key metrics:

1. **Total Users** - All students, faculty, and admins combined
2. **Active Accounts** - Users with 'Active' status
3. **2FA Enabled** - Count of users with two-factor authentication enabled
4. **Locked Accounts** - Users with 'Locked' status

---

## 🔎 Search & Filter

### Search Bar
- Type to search by: Name, User ID, or Email
- Real-time filtering as you type
- Press Enter to search immediately

### Filters
- **Role Filter**: Select Student, Faculty, or Admin
- **Status Filter**: Select Active, Locked, or Suspended
- **Reset Button**: Clear all filters and search

---

## 👥 User Table

### Columns
- **User ID**: Unique identifier
- **Name**: Full name of user
- **Email**: Email address
- **Role**: Badge showing Student/Faculty/Admin
- **2FA Status**: Toggle switch to enable/disable
- **Account Status**: Active, Locked, or Suspended
- **Actions**: Buttons for password reset and lock/unlock

### Actions Available

#### 1. Toggle 2FA
- Click the toggle switch in the "2FA Status" column
- Green = Enabled, Gray = Disabled
- Changes save automatically

#### 2. Reset Password
- Click "Reset Password" button
- Modal opens with password fields
- Enter new password (min 6 characters)
- Confirm password
- Click "Reset Password" to submit

#### 3. Lock/Unlock Account
- **Lock**: Click "Lock" button → Confirm → Account locked
- **Unlock**: Click "Unlock" button → Confirm → Account unlocked
- Status updates immediately

---

## 📝 Security Activity Logs

### Location
Bottom of the page

### Features
- Shows recent 10 notifications/security events
- Displays date and message
- Click "Refresh" button to reload logs
- Auto-refreshes every 30 seconds

---

## 🔄 Auto-Refresh

- Page automatically reloads data every 30 seconds
- Pauses when browser tab is hidden (saves resources)
- Resumes when tab becomes active again

---

## ⚠️ Important Notes

### Password Reset
- Minimum 6 characters required
- Both password fields must match
- Action cannot be undone
- User will need to use new password immediately

### Account Locking
- Locked accounts cannot login
- Existing sessions may remain active
- Unlock to restore access

### 2FA Toggle
- Currently prepares database field
- Full 2FA implementation requires additional setup
- Toggle indicates intent to use 2FA

---

## 🎨 Visual Indicators

### Role Badges
- 🔵 **Blue** = Student
- 🟣 **Purple** = Faculty
- 🔴 **Pink** = Admin

### Status Colors
- 🟢 **Green** = Active
- 🔴 **Red** = Locked
- 🟠 **Orange** = Suspended

### Statistics Icons
- 👥 Users
- ✅ Active
- 🔒 2FA
- ⚠️ Locked

---

## 📱 Mobile Usage

### Responsive Features
- Tables convert to card layout on mobile
- Touch-friendly buttons and toggles
- Filters stack vertically
- All features fully accessible

---

## 🛠️ Troubleshooting

### Page Not Loading
1. Check backend server is running
2. Verify URL: `http://127.0.0.1:8000`
3. Check browser console for errors

### Data Not Showing
1. Ensure database has users
2. Check network tab for failed API calls
3. Verify admin authentication headers

### Actions Not Working
1. Confirm you have admin privileges
2. Check server logs for errors
3. Ensure database connections are active

### Search/Filter Not Working
1. Clear browser cache
2. Reload the page
3. Check JavaScript console for errors

---

## 🔐 Security Best Practices

1. **Regular Reviews**: Check security logs weekly
2. **Lock Unused Accounts**: Lock accounts that are no longer needed
3. **Strong Passwords**: Enforce strong passwords when resetting
4. **Enable 2FA**: Encourage users to enable 2FA when available
5. **Monitor Activity**: Watch for suspicious login patterns

---

## 📞 Support Information

For technical issues or questions:
- Check logs in: `backend/edu_track.log`
- Run tests: `python backend/scripts/test_security_settings.py`
- Review documentation: `docs/SECURITY_SETTINGS_ENHANCEMENT.md`

---

## ⌨️ Keyboard Shortcuts

- **Enter** in search: Execute search
- **Esc** in modal: Close modal
- **Tab**: Navigate between fields

---

**Last Updated**: December 7, 2025
**Version**: 1.0
**Status**: Production Ready
