#!/bin/bash -lx

echo "DEPLOY STARTED!"

NEW_UUID=$(( ( RANDOM  )  + 1 ))

PORT=$((8003))

kill `lsof -t -i:$PORT`

cd /www/django/releases
rm -rf ./*/

git clone -b python3 git@github.com:bigskytech/bsrs.git $NEW_UUID

cd $NEW_UUID
cd bsrs-ember
npm install

./node_modules/ember-cli/bin/ember build --env=production

cd ../bsrs-django
rm -rf venv
virtualenv -p /usr/local/bin/python3 venv
venv/bin/pip install -r requirements.txt

DB_NAME="staging"
export PGPASSWORD=tango
dropdb $DB_NAME -U bsdev
createdb $DB_NAME -U bsdev -O bsdev

cd bigsky/
export DJANGO_SETTINGS_MODULE='bigsky.settings.staging'
../venv/bin/python manage.py makemigrations
../venv/bin/python manage.py migrate

../venv/bin/python manage.py loaddata fixtures/jenkins.json
../venv/bin/python manage.py loaddata fixtures/jenkins_custom.json

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/fonts .
cp -r ../../bsrs-ember/dist/index.html templates

uwsgi --http :$PORT --wsgi-file bigsky.wsgi --virtualenv /www/django/releases/$NEW_UUID/bsrs-django/venv --daemonize /tmp/bigsky.log --static-map /assets=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --static-map /fonts=/www/django/releases/$NEW_UUID/bsrs-django/bigsky --check-static /www/django/releases/$NEW_UUID/bsrs-django/bigsky

echo "DEPLOY FINISHED!"
exit 0
