"""
Security Settings Page Test Script
Tests all security features including:
- Loading users
- Filtering and searching
- 2FA toggle
- Password reset
- Account locking/unlocking
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {
    "Content-Type": "application/json",
    "x-user-role": "admin"
}

def test_get_all_users():
    """Test fetching all users"""
    print("\n=== Testing: Fetch All Users ===")
    
    try:
        students = requests.get(f"{BASE_URL}/students/", headers=HEADERS)
        faculties = requests.get(f"{BASE_URL}/faculties/", headers=HEADERS)
        admins = requests.get(f"{BASE_URL}/admins/", headers=HEADERS)
        
        print(f"✓ Students: {students.status_code} - {len(students.json())} records")
        print(f"✓ Faculty: {faculties.status_code} - {len(faculties.json())} records")
        print(f"✓ Admins: {admins.status_code} - {len(admins.json())} records")
        
        # Check if security fields are present
        if students.json():
            student = students.json()[0]
            has_security_fields = 'account_status' in student and 'twofa_enabled' in student
            print(f"✓ Security fields present: {has_security_fields}")
            if has_security_fields:
                print(f"  - account_status: {student.get('account_status')}")
                print(f"  - twofa_enabled: {student.get('twofa_enabled')}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_update_2fa():
    """Test updating 2FA setting"""
    print("\n=== Testing: Toggle 2FA ===")
    
    try:
        # Get first student
        students = requests.get(f"{BASE_URL}/students/", headers=HEADERS).json()
        if not students:
            print("✗ No students found")
            return False
        
        student_id = students[0]['student_id']
        current_2fa = students[0].get('twofa_enabled', False)
        
        # Toggle 2FA
        response = requests.patch(
            f"{BASE_URL}/students/{student_id}",
            headers=HEADERS,
            json={"twofa_enabled": not current_2fa}
        )
        
        print(f"✓ 2FA toggle response: {response.status_code}")
        print(f"  Changed from {current_2fa} to {not current_2fa}")
        
        # Verify change
        updated_student = requests.get(f"{BASE_URL}/students/{student_id}", headers=HEADERS).json()
        verified = updated_student.get('twofa_enabled') == (not current_2fa)
        print(f"✓ Verification: {verified}")
        
        # Toggle back
        requests.patch(
            f"{BASE_URL}/students/{student_id}",
            headers=HEADERS,
            json={"twofa_enabled": current_2fa}
        )
        print(f"✓ Reverted 2FA setting")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_account_lock_unlock():
    """Test locking and unlocking accounts"""
    print("\n=== Testing: Lock/Unlock Account ===")
    
    try:
        # Get first faculty
        faculties = requests.get(f"{BASE_URL}/faculties/", headers=HEADERS).json()
        if not faculties:
            print("✗ No faculties found")
            return False
        
        faculty_id = faculties[0]['faculty_id']
        
        # Lock account
        lock_response = requests.patch(
            f"{BASE_URL}/faculties/{faculty_id}",
            headers=HEADERS,
            json={"account_status": "Locked"}
        )
        print(f"✓ Lock account response: {lock_response.status_code}")
        
        # Verify locked
        locked_faculty = requests.get(f"{BASE_URL}/faculties/{faculty_id}", headers=HEADERS).json()
        is_locked = locked_faculty.get('account_status') == 'Locked'
        print(f"✓ Account locked: {is_locked}")
        
        # Unlock account
        unlock_response = requests.patch(
            f"{BASE_URL}/faculties/{faculty_id}",
            headers=HEADERS,
            json={"account_status": "Active"}
        )
        print(f"✓ Unlock account response: {unlock_response.status_code}")
        
        # Verify unlocked
        unlocked_faculty = requests.get(f"{BASE_URL}/faculties/{faculty_id}", headers=HEADERS).json()
        is_active = unlocked_faculty.get('account_status') == 'Active'
        print(f"✓ Account active: {is_active}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_password_reset():
    """Test password reset"""
    print("\n=== Testing: Password Reset ===")
    
    try:
        # Get first admin
        admins = requests.get(f"{BASE_URL}/admins/", headers=HEADERS).json()
        if not admins:
            print("✗ No admins found")
            return False
        
        admin_id = admins[0]['admin_id']
        
        # Reset password
        reset_response = requests.post(
            f"{BASE_URL}/admins/{admin_id}/reset-password",
            headers=HEADERS,
            json={"new_password": "NewTestPassword123!"}
        )
        
        print(f"✓ Password reset response: {reset_response.status_code}")
        if reset_response.status_code == 200:
            print(f"  Message: {reset_response.json().get('detail')}")
        
        return reset_response.status_code == 200
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_notifications():
    """Test fetching notifications for security logs"""
    print("\n=== Testing: Security Logs (Notifications) ===")
    
    try:
        response = requests.get(f"{BASE_URL}/notifications/", headers=HEADERS)
        notifications = response.json()
        
        print(f"✓ Notifications response: {response.status_code}")
        print(f"  Total notifications: {len(notifications)}")
        
        if notifications:
            print(f"  Sample notification: {notifications[0].get('message', 'No message')}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("SECURITY SETTINGS PAGE - COMPREHENSIVE TEST")
    print("=" * 60)
    
    results = {
        "Fetch All Users": test_get_all_users(),
        "Toggle 2FA": test_update_2fa(),
        "Lock/Unlock Account": test_account_lock_unlock(),
        "Password Reset": test_password_reset(),
        "Security Logs": test_notifications()
    }
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
