import sqlite3
import os
from app.core.config import Config

DB_FILE = Config.DB_PATH

def get_db_connection():
    """
    Returns a connection to the SQLite database.
    Enforces foreign keys and returns rows as dictionaries.
    """
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Creates tables if they do not exist.
    """
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    
    # 2. Jurisdictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jurisdictions (
        id TEXT PRIMARY KEY,
        department TEXT NOT NULL,
        location_pattern TEXT NOT NULL,
        pio_name TEXT NOT NULL,
        pio_address TEXT NOT NULL,
        pio_email TEXT NOT NULL
    );
    """)
    
    # 3. Cases Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        raw_complaint TEXT NOT NULL,
        raw_complaint_original TEXT,
        raw_complaint_language TEXT,
        classification TEXT NOT NULL,
        confidence_tier TEXT NOT NULL,
        department TEXT NOT NULL,
        location TEXT NOT NULL,
        status TEXT NOT NULL,
        filed_at TEXT,
        deadline_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)
    
    # 4. Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        type TEXT NOT NULL, -- 'rti_application' or 'first_appeal'
        content TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")
