#!/bin/bash
set -e

echo "=== Installing Python dependencies ==="
pip install -r business/requirements.txt

echo "=== Building React frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Running Django migrations with Railway PostgreSQL ==="
cd business

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL}" ]; then
    echo "❌ DATABASE_URL is not set. Please add it to Render environment variables."
    exit 1
fi

echo "Database configuration detected..."
python manage.py migrate --noinput

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput --clear

echo "=== Checking superuser creation ==="
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
User = get_user_model()

# Check if ANY superuser exists, not just specific username
if not User.objects.filter(is_superuser=True).exists():
    username = os.environ.get('SUPERUSER_USERNAME', 'admin')
    email = os.environ.get('SUPERUSER_EMAIL', 'admin@example.com')
    password = os.environ.get('SUPERUSER_PASSWORD')
    
    if password:
        try:
            User.objects.create_superuser(username, email, password)
            print(f'✅ Superuser {username} created successfully!')
        except Exception as e:
            print(f'❌ Error creating superuser: {e}')
    else:
        print('⚠️  SUPERUSER_PASSWORD not set - skipping superuser creation')
else:
    superusers = User.objects.filter(is_superuser=True)
    usernames = [user.username for user in superusers]
    print(f'✅ Superuser(s) already exist: {", ".join(usernames)}')
"

echo "✅ Build completed successfully!"