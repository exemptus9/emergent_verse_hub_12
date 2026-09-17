from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

FRONTEND_URL = os.environ.get('FRONTEND_URL', os.environ.get('REACT_APP_BACKEND_URL', ''))

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')

SESSION_DURATION = 86400  # 24 hours
MAX_LOGIN_ATTEMPTS = 10
LOGIN_WINDOW = 300  # 5 minutes
MAX_CONTACT_ATTEMPTS = 5
CONTACT_WINDOW = 3600  # 1 hour


def update_admin_password(new_password: str):
    """Update the admin password in memory and persist to .env file."""
    global ADMIN_PASSWORD
    ADMIN_PASSWORD = new_password
    env_path = ROOT_DIR / '.env'
    lines = env_path.read_text().splitlines()
    updated = False
    for i, line in enumerate(lines):
        if line.startswith('ADMIN_PASSWORD='):
            lines[i] = f'ADMIN_PASSWORD={new_password}'
            updated = True
            break
    if not updated:
        lines.append(f'ADMIN_PASSWORD={new_password}')
    env_path.write_text('\n'.join(lines) + '\n')
