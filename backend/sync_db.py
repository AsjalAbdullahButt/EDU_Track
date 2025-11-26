import os
import pymysql
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQL_FILE = os.path.join(BASE_DIR, 'SQL', 'EDU-Track.sql')

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'EDU_Track')
DB_PORT = int(os.getenv('DB_PORT', 3306))

def get_conn():
    return pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT, autocommit=True)

def has_tables(conn):
    with conn.cursor() as cur:
        cur.execute("SHOW TABLES")
        return cur.fetchone() is not None

def run_sql_file(conn, path):
    with open(path, 'r', encoding='utf-8') as f:
        sql = f.read()
    # Split on ';' for simple statements. If file contains delimiter comments, this may need refinement.
    statements = [s.strip() for s in sql.split(';') if s.strip()]
    with conn.cursor() as cur:
        for stmt in statements:
            try:
                cur.execute(stmt)
            except Exception as e:
                print('Failed statement:', stmt[:100].replace('\n',' '))
                print('Error:', e)

def main():
    if not os.path.isfile(SQL_FILE):
        print('SQL file not found at', SQL_FILE)
        return

    conn = get_conn()
    try:
        if has_tables(conn):
            ans = input('Database appears to have tables already. Continue and run SQL file? [y/N]: ')
            if ans.lower() != 'y':
                print('Aborted by user.')
                return
        print('Running SQL file...')
        run_sql_file(conn, SQL_FILE)
        print('SQL import complete.')
    finally:
        conn.close()

if __name__ == '__main__':
    main()
