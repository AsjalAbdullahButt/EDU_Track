"""
Migration script to add security fields to Student, Faculty, and Admin tables.
This adds account_status and twofa_enabled columns.
"""

from sqlalchemy import Column, String, Boolean, text
from database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_security_fields():
    """Add account_status and twofa_enabled columns to user tables"""
    
    with engine.connect() as conn:
        try:
            # Add columns to Student table
            logger.info("Adding security fields to Student table...")
            try:
                conn.execute(text("""
                    ALTER TABLE Student 
                    ADD COLUMN account_status VARCHAR(20) DEFAULT 'Active'
                """))
                conn.commit()
                logger.info("✓ Added account_status to Student")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    logger.info("✓ account_status already exists in Student")
                else:
                    raise
            
            try:
                conn.execute(text("""
                    ALTER TABLE Student 
                    ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                logger.info("✓ Added twofa_enabled to Student")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    logger.info("✓ twofa_enabled already exists in Student")
                else:
                    raise
            
            # Add columns to Faculty table
            logger.info("Adding security fields to Faculty table...")
            try:
                conn.execute(text("""
                    ALTER TABLE Faculty 
                    ADD COLUMN account_status VARCHAR(20) DEFAULT 'Active'
                """))
                conn.commit()
                logger.info("✓ Added account_status to Faculty")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    logger.info("✓ account_status already exists in Faculty")
                else:
                    raise
            
            try:
                conn.execute(text("""
                    ALTER TABLE Faculty 
                    ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                logger.info("✓ Added twofa_enabled to Faculty")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    logger.info("✓ twofa_enabled already exists in Faculty")
                else:
                    raise
            
            # Add columns to Admin table
            logger.info("Adding security fields to Admin table...")
            try:
                conn.execute(text("""
                    ALTER TABLE Admin 
                    ADD COLUMN account_status VARCHAR(20) DEFAULT 'Active'
                """))
                conn.commit()
                logger.info("✓ Added account_status to Admin")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    logger.info("✓ account_status already exists in Admin")
                else:
                    raise
            
            try:
                conn.execute(text("""
                    ALTER TABLE Admin 
                    ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                logger.info("✓ Added twofa_enabled to Admin")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    logger.info("✓ twofa_enabled already exists in Admin")
                else:
                    raise
            
            logger.info("✅ Security fields migration completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    add_security_fields()
