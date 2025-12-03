from backend.database import get_connection
import json

def main():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT student_id, full_name, email, password FROM Student ORDER BY student_id DESC LIMIT 10")
        rows = cur.fetchall()
        print(json.dumps(rows, default=str, indent=2))
    except Exception as e:
        print('ERROR:', e)
    finally:
        try:
            cur.close()
        except:
            pass
        if conn:
            conn.close()

if __name__ == '__main__':
    main()
