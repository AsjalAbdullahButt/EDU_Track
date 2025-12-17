import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="HelloMySql123",
        database="edu_track"
    )
    cursor = conn.cursor()
    
    cursor.execute("SELECT student_id, course_id FROM marks ORDER BY student_id, course_id")
    results = cursor.fetchall()
    
    print("All marks in database:")
    print("=" * 50)
    print(f"Total records: {len(results)}\n")
    
    student_courses = {}
    for sid, cid in results:
        if sid not in student_courses:
            student_courses[sid] = []
        student_courses[sid].append(cid)
    
    for sid in sorted(student_courses.keys()):
        courses = sorted(student_courses[sid])
        print(f"Student {sid}: Has marks for courses {courses}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
