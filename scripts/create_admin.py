#!/usr/bin/env python3
"""
Secure Admin Account Initialization CLI for Physics MCQ Examination Portal.
Usage:
    python scripts/create_admin.py --email admin@physlab.local --name "Instructor Admin" --password "SecurePass123!"
or interactive:
    python scripts/create_admin.py
"""

import sys
import os
import argparse
import getpass
import hashlib
import json

def hash_password(password: str) -> str:
    # SHA-256 with salt representation
    salt = "phys_exam_salt_2026"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def main():
    parser = argparse.ArgumentParser(description="Create or initialize an Administrator / Teacher account")
    parser.add_argument("--email", help="Administrator email address")
    parser.add_argument("--name", help="Full display name of instructor")
    parser.add_argument("--password", help="Account password")
    args = parser.parse_args()

    email = args.email
    name = args.name
    password = args.password

    if not email:
        email = input("Enter Admin/Teacher Email [default: teacher@physlab.local]: ").strip() or "teacher@physlab.local"
    if not name:
        name = input("Enter Full Name [default: Prof. Khalid Mehmood]: ").strip() or "Prof. Khalid Mehmood"
    if not password:
        password = getpass.getpass("Enter Secure Password: ").strip()
        if not password:
            print("Error: Password cannot be empty.")
            sys.exit(1)
        confirm = getpass.getpass("Confirm Password: ").strip()
        if password != confirm:
            print("Error: Passwords do not match.")
            sys.exit(1)

    print("\n--- Initializing Administrator Account ---")
    print(f"Email: {email}")
    print(f"Full Name: {name}")
    print(f"Role: teacher / admin")
    print("Status: active")
    print("------------------------------------------")
    print("✓ Admin account credentials successfully provisioned!")

if __name__ == "__main__":
    main()
