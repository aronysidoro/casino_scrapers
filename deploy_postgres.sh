#!/bin/bash -lx

echo "DEPLOY STARTED!"

NEW_UUID=$(( ( RANDOM  )  + 1 ))

cd /www/django/releases

git clone git@github.com:bigskytech/bsrs.git $NEW_UUID

cd $NEW_UUID
cd bsrs-ember/
npm install

UWSGI_PORT=$((8002))

echo "KILL UWSGI PROCESSES ON PORT $UWSGI_PORT"
lsof -i tcp:$UWSGI_PORT | awk 'NR!=1 {print $2}' | xargs kill

./node_modules/ember-cli/bin/ember build --env=production
cd ../

echo "CREATE VIRTUALENV AND PIP DEPENDENCIES"
rm -rf venv
virtualenv venv
venv/bin/pip install -r bsrs-django/requirements.txt

cd bsrs-django/bigsky


DB_NAME="staging"
echo "DB NAME TO DROP: $DB_NAME"
export PGPASSWORD=tango

dropdb $DB_NAME -U bsdev
echo "$DB_NAME dropped"

createdb $DB_NAME -U bsdev -O bsdev
echo "$DB_NAME created"

echo "RUN DATABASE MIGRATIONS"
export DJANGO_SETTINGS_MODULE='bigsky.settings.staging'
../../venv/bin/python manage.py collectstatic --noinput
../../venv/bin/python manage.py makemigrations
../../venv/bin/python manage.py migrate
../../venv/bin/python manage.py loaddata fixtures/postgres.json

echo "COPY OVER EMBER STATIC ASSETS"
cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/fonts .
cp -r ../../bsrs-ember/dist/index.html templates

uwsgi --http :$UWSGI_PORT --wsgi-file bigsky_postgres.wsgi --virtualenv /www/django/releases/$NEW_UUID/venv --daemonize /tmp/bigsky.log --static-map /assets=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --static-map /fonts=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --check-static /www/django/releases/$NEW_UUID/bsrs-django/bigsky

echo "DEPLOY FINISHED!"
exit 0
