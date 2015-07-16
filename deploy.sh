#!/bin/bash -lx

echo "DEPLOY STARTED!"

NEW_UUID=$(( ( RANDOM  )  + 1 ))

cd /www/django/releases

git clone git@github.com:bigskytech/bsrs.git $NEW_UUID

cd $NEW_UUID
cd bsrs-ember/
npm install

killall -s INT uwsgi

./node_modules/ember-cli/bin/ember build --env=production
cd ../

virtualenv venv
venv/bin/pip install -r bsrs-django/requirements.txt

cd bsrs-django/bigsky

../../venv/bin/python manage.py migrate --settings=bigsky.settings.ci

MIGRATE_EXIT=$?
if [ "$MIGRATE_EXIT" == 1 ]; then
  echo "DEPLOY MIGRATION FAILED!"
  exit $MIGRATE_EXIT
fi

cp -r ../../bsrs-ember/dist/assets .
cp -r ../../bsrs-ember/dist/index.html templates

uwsgi --http :8000 --wsgi-file bigsky.wsgi --virtualenv /www/django/releases/$NEW_UUID/venv --daemonize /tmp/bigsky.log

WSGI_EXIT=$?
if [ "$WSGI_EXIT" == 1 ]; then
  echo "WSGI FAILED!"
  exit $WSGI_EXIT
fi

echo "DEPLOY SUCCESSFUL!"
exit 0
