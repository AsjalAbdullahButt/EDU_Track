"""
Migration script to add course_status and description columns to Course table
"""
from sqlalchemy import text
from database import engine, SessionLocal

def update_course_schema():
    """Add course_status and description columns to Course table if they don't exist"""
    
    db = SessionLocal()
    try:
        print("🔄 Checking Course table schema...")
        
        # Check if columns already exist
        check_status_query = text("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Course' 
            AND COLUMN_NAME = 'course_status'
        """)
        
        check_description_query = text("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Course' 
            AND COLUMN_NAME = 'description'
        """)
        
        status_exists = db.execute(check_status_query).scalar()
        description_exists = db.execute(check_description_query).scalar()
        
        # Add course_status column if it doesn't exist
        if not status_exists:
            print("➕ Adding course_status column...")
            add_status_query = text("""
                ALTER TABLE Course
                ADD course_status VARCHAR(20) DEFAULT 'Pending'
            """)
            db.execute(add_status_query)
            db.commit()
            print("✅ course_status column added successfully")
            
            # Update existing courses to have 'Active' status
            update_existing = text("""
                UPDATE Course
                SET course_status = 'Active'
                WHERE course_status IS NULL OR course_status = 'Pending'
            """)
            db.execute(update_existing)
            db.commit()
            print("✅ Updated existing courses to Active status")
        else:
            print("✓ course_status column already exists")
        
        # Add description column if it doesn't exist
        if not description_exists:
            print("➕ Adding description column...")
            add_description_query = text("""
                ALTER TABLE Course
                ADD description VARCHAR(500) NULL
            """)
            db.execute(add_description_query)
            db.commit()
            print("✅ description column added successfully")
        else:
            print("✓ description column already exists")
        
        print("\n✅ Course table schema update completed successfully!")
        
        # Show current course count and status distribution
        count_query = text("SELECT COUNT(*) as total FROM Course")
        total = db.execute(count_query).scalar()
        print(f"\n📊 Total courses in database: {total}")
        
        if total > 0:
            status_dist = text("""
                SELECT course_status, COUNT(*) as count
                FROM Course
                GROUP BY course_status
            """)
            print("\n📈 Course status distribution:")
            for row in db.execute(status_dist):
                print(f"   {row.course_status}: {row.count}")
        
    except Exception as e:
        print(f"❌ Error updating schema: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Course Schema Migration Script")
    print("=" * 60)
    update_course_schema()
    print("=" * 60)
