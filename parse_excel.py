import pandas as pd
import json

df = pd.read_excel('va-list.xlsx', header=1)
records = df.to_dict(orient='records')

with open('va_temp.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f"Exported {len(records)} records to va_temp.json successfully.")
