import sys
import io
import os

# Redirect stdout to stderr initially to capture any library noise (like warnings or logs)
# that might break the JSON output format.
original_stdout = sys.stdout
sys.stdout = sys.stderr

import argparse
import json

# Ensure we can handle unicode if needed (though we redirect to stderr mostly now)
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8') 

try:
    from pydexcom import Dexcom
except ImportError:
    # We must restore stdout to print the error JSON
    sys.stdout = original_stdout
    print(json.dumps({"success": False, "error": "pydexcom library not found"}))
    sys.exit(1)

def login(args):
    try:
        region = "ous" if args.region == "OUS" else "us"
        # Use keyword args explicitly
        dexcom = Dexcom(username=args.username, password=args.password, region=region)
        return {
            "success": True, 
            "message": "Authenticated",
            "username": dexcom.username,
            "accountId": dexcom.account_id
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_readings(args):
    try:
        region = "ous" if args.region == "OUS" else "us"
        dexcom = Dexcom(username=args.username, password=args.password, region=region)
        
        # Fetch readings (minutes=1440 is 24 hours)
        # Dexcom Share API limits to last 24h. Requesting more causes errors.
        readings = dexcom.get_glucose_readings(minutes=1440, max_count=288)
        
        data = []
        for r in readings:
            data.append({
                "value": r.value,
                "trend": r.trend_description,
                "time": r.datetime.isoformat(),
                "json": r.json
            })
            
        return {"success": True, "data": data}

    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    parser = argparse.ArgumentParser(description='Dexcom Bridge')
    parser.add_argument('--action', required=True, choices=['login', 'readings'])
    parser.add_argument('--username', required=True)
    parser.add_argument('--password', required=True)
    parser.add_argument('--region', default='US')

    args = parser.parse_args()

    result = {}
    if args.action == 'login':
        result = login(args)
    elif args.action == 'readings':
        result = get_readings(args)

    # RESTORE STDOUT to print the final JSON
    sys.stdout = original_stdout
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    print(json.dumps(result))

if __name__ == "__main__":
    main()
