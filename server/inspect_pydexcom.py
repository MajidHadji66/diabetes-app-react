import sys
import io
import getpass
from pydexcom import Dexcom

# Python 3 input
try:
    input_func = raw_input
except NameError:
    input_func = input

username = input_func("Dexcom Username: ")
password = getpass.getpass("Dexcom Password: ")

try:
    dexcom = Dexcom(username=username, password=password)
    print("\n--- Inspecting Dexcom Object ---")
    print(dir(dexcom))
    print("\n--- Attributes ---")
    print(dexcom.__dict__)
except Exception as e:
    print(f"Error: {e}")
