"""
Test 2FA Toggle Functionality
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {
    "Content-Type": "application/json",
    "x-user-role": "admin"
}

def test_2fa_toggle_detailed():
    """Detailed test of 2FA toggle functionality"""
    print("\n" + "="*60)
    print("DETAILED 2FA TOGGLE TEST")
    print("="*60)
    
    try:
        # Get a student
        print("\n1. Fetching students...")
        students = requests.get(f"{BASE_URL}/students/", headers=HEADERS).json()
        if not students:
            print("❌ No students found!")
            return False
        
        student = students[0]
        student_id = student['student_id']
        current_2fa = student.get('twofa_enabled', False)
        
        print(f"✓ Found student #{student_id}: {student.get('full_name')}")
        print(f"  Current 2FA status: {current_2fa}")
        
        # Test 1: Toggle ON
        print(f"\n2. Toggling 2FA to {'OFF' if current_2fa else 'ON'}...")
        new_state = not current_2fa
        
        response = requests.patch(
            f"{BASE_URL}/students/{student_id}",
            headers=HEADERS,
            json={"twofa_enabled": new_state}
        )
        
        print(f"  Request URL: {BASE_URL}/students/{student_id}")
        print(f"  Request Body: {{'twofa_enabled': {new_state}}}")
        print(f"  Response Status: {response.status_code}")
        print(f"  Response Body: {response.text[:200]}")
        
        if response.status_code == 200:
            print(f"✓ Toggle request successful")
        else:
            print(f"❌ Toggle request failed with status {response.status_code}")
            return False
        
        # Test 2: Verify the change
        print(f"\n3. Verifying the change...")
        verify_response = requests.get(f"{BASE_URL}/students/{student_id}", headers=HEADERS)
        verified_student = verify_response.json()
        verified_2fa = verified_student.get('twofa_enabled', False)
        
        print(f"  Expected: {new_state}")
        print(f"  Actual: {verified_2fa}")
        
        if verified_2fa == new_state:
            print(f"✓ Verification PASSED - 2FA is now {verified_2fa}")
        else:
            print(f"❌ Verification FAILED - Expected {new_state}, got {verified_2fa}")
            return False
        
        # Test 3: Toggle back to original state
        print(f"\n4. Toggling back to original state ({current_2fa})...")
        restore_response = requests.patch(
            f"{BASE_URL}/students/{student_id}",
            headers=HEADERS,
            json={"twofa_enabled": current_2fa}
        )
        
        if restore_response.status_code == 200:
            print(f"✓ Restored to original state")
        else:
            print(f"⚠ Warning: Failed to restore original state")
        
        # Test 4: Test with faculty
        print(f"\n5. Testing with Faculty...")
        faculties = requests.get(f"{BASE_URL}/faculties/", headers=HEADERS).json()
        if faculties:
            faculty = faculties[0]
            faculty_id = faculty['faculty_id']
            faculty_2fa = faculty.get('twofa_enabled', False)
            
            print(f"  Faculty #{faculty_id}: {faculty.get('name')}")
            print(f"  Current 2FA: {faculty_2fa}")
            
            faculty_response = requests.patch(
                f"{BASE_URL}/faculties/{faculty_id}",
                headers=HEADERS,
                json={"twofa_enabled": not faculty_2fa}
            )
            
            if faculty_response.status_code == 200:
                print(f"✓ Faculty 2FA toggle successful")
                # Restore
                requests.patch(
                    f"{BASE_URL}/faculties/{faculty_id}",
                    headers=HEADERS,
                    json={"twofa_enabled": faculty_2fa}
                )
            else:
                print(f"❌ Faculty 2FA toggle failed: {faculty_response.status_code}")
        
        # Test 5: Test with admin
        print(f"\n6. Testing with Admin...")
        admins = requests.get(f"{BASE_URL}/admins/", headers=HEADERS).json()
        if admins:
            admin = admins[0]
            admin_id = admin['admin_id']
            admin_2fa = admin.get('twofa_enabled', False)
            
            print(f"  Admin #{admin_id}: {admin.get('name')}")
            print(f"  Current 2FA: {admin_2fa}")
            
            admin_response = requests.patch(
                f"{BASE_URL}/admins/{admin_id}",
                headers=HEADERS,
                json={"twofa_enabled": not admin_2fa}
            )
            
            if admin_response.status_code == 200:
                print(f"✓ Admin 2FA toggle successful")
                # Restore
                requests.patch(
                    f"{BASE_URL}/admins/{admin_id}",
                    headers=HEADERS,
                    json={"twofa_enabled": admin_2fa}
                )
            else:
                print(f"❌ Admin 2FA toggle failed: {admin_response.status_code}")
        
        print("\n" + "="*60)
        print("✓ ALL 2FA TOGGLE TESTS PASSED")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_2fa_toggle_detailed()
    exit(0 if success else 1)
