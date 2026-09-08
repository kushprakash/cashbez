import pandas as pd
import pymysql
import re
from datetime import datetime

print("Reading va-list.xlsx...")
df = pd.read_excel('va-list.xlsx', header=1)
print(f"Total rows read from Excel: {len(df)}")

conn = pymysql.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="bharat-pay",
    port=3306,
    autocommit=True
)

cursor = conn.cursor()

def clean_val(val):
    if pd.isna(val):
        return None
    s = str(val).strip()
    return s if s != '' and s.lower() != 'nan' else None

def parse_date(date_str):
    if not date_str or pd.isna(date_str):
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    s = str(date_str).strip()
    s_clean = re.sub(r'\s*(AM|PM|am|pm)$', '', s)
    for fmt in ('%d-%m-%Y %H:%M:%S', '%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y/%m/%d %H:%M:%S'):
        try:
            dt = datetime.strptime(s_clean, fmt)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            pass
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# Truncate existing va table
cursor.execute("TRUNCATE TABLE `va`;")

insert_sql = """
INSERT INTO `va` (
    `id`, `mid`, `mobile`, `username`, `account_number`, `account_ifsc`,
    `virtual_account_id`, `virtual_account_number`, `virtual_ifsc`,
    `virtual_upi_handle`, `status`, `created_at`, `updated_at`
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

records = []
now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

for idx, row in df.iterrows():
    row_id = int(row['id']) if not pd.isna(row['id']) else (idx + 1)
    mid = None
    mobile = clean_val(row.get('Mobile No'))
    username = clean_val(row.get('Username'))
    account_number = clean_val(row.get('Account Number'))
    account_ifsc = clean_val(row.get('Account IFSC'))
    virtual_account_id = clean_val(row.get('Virtual Account ID'))
    virtual_account_number = clean_val(row.get('Virtual Account Number'))
    virtual_ifsc = clean_val(row.get('Virtual IFSC'))
    virtual_upi_handle = clean_val(row.get('Virtual Upi Handle'))
    status = 1
    created_at = parse_date(clean_val(row.get('Created At')))
    updated_at = now_str

    records.append((
        row_id, mid, mobile, username, account_number, account_ifsc,
        virtual_account_id, virtual_account_number, virtual_ifsc,
        virtual_upi_handle, status, created_at, updated_at
    ))

cursor.executemany(insert_sql, records)

cursor.execute("SELECT COUNT(*) FROM `va`;")
count = cursor.fetchone()[0]
print(f"IMPORT COMPLETE! Total records inserted into 'va' table: {count}")

cursor.close()
conn.close()
