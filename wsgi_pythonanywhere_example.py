# ============================================================
# PythonAnywhere WSGI configuration — example file
#
# On PythonAnywhere, go to the "Web" tab, open the auto-generated
# WSGI file (something like /var/www/yourusername_pythonanywhere_com_wsgi.py),
# delete everything in it, and paste this in — then edit the two
# paths/values marked below.
# ============================================================

import sys
import os

# 1. Point this to the folder that contains app.py
#    (replace 'yourusername' and the folder name with your actual path)
project_home = "/home/yourusername/cse-resource-hub"
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 2. Set your real admin credentials + a secret key here.
#    This file is NOT inside your project's git repo (it lives directly on
#    the server), so it's safe to put real values here — just never copy
#    this file's content into anything you push to GitHub.
os.environ["ADMIN_EMAIL"] = "your-email@example.com"
os.environ["ADMIN_PASSWORD"] = "your-strong-password"
os.environ["SECRET_KEY"] = "replace-with-a-long-random-string"

# 3. Import the Flask app — PythonAnywhere looks for a variable
#    named "application"
from app import app as application  # noqa: E402
