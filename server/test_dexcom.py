import getpass
import sys

# Try to import pydexcom
try:
    from pydexcom import Dexcom
except ImportError:
    print("Error: 'pydexcom' library not found.")
    print("Please run: pip install pydexcom")
    sys.exit(1)

def test_login(username, password, ous=False):
    region_arg = "ous" if ous else "us"
    region_name = "OUS (Outside US)" if ous else "US"
    print(f"\nTesting {region_name}...")
    try:
        # pydexcom constructor attempts login immediately
        dexcom = Dexcom(username=username, password=password, region=region_arg)
        
        # Try to get data to be sure
        bg = dexcom.get_current_glucose_reading()
        
        print(f"✅ SUCCESS! Connected to {region_name}")
        if bg:
            # pydexcom Reading object has: value, trend, trend_description, arrow, datetime, json
            print(f"   Latest Reading: {bg.value} mg/dL ({bg.trend_description}) at {bg.datetime}")
            print(f"   Raw: {bg.json}")
        else:
            print("   Connected, but no recent reading found (Session is valid though).")
        return True
    except Exception as e:
        print(f"❌ FAILED {region_name}: {e}")
        return False

def main():
    print("--- pydexcom Diagnostic Script ---")
    print("This script uses the Python 'pydexcom' library to verify credentials.\n")
    
    # Python 3 input
    try:
        input_func = raw_input
    except NameError:
        input_func = input

    username = input_func("Dexcom Username: ")
    password = getpass.getpass("Dexcom Password: ")

    print("\n----------------------------------------")
    
    success_us = test_login(username, password, ous=False)
    success_ous = test_login(username, password, ous=True)

    print("\n----------------------------------------")
    if success_us:
        print("SUMMARY: ✅ WORKS with US Region.")
    elif success_ous:
        print("SUMMARY: ✅ WORKS with Outside US Region.")
    else:
        print("SUMMARY: ❌ FAILED on both regions with pydexcom.")

if __name__ == "__main__":
    main()
