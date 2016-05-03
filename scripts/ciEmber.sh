#!/bin/bash -lx

echo $(date -u) "EMBER BUILD STARTED!"

# Start at root of project
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR
cd ../

function npmInstall {
    npm install --no-optional
    NPM_INSTALL=$?
    echo $NPM_INSTALL
    if [ "$NPM_INSTALL" == 1 ]; then
      echo "npm install failed"
      exit $NPM_INSTALL
    fi
}

function emberTest {
    if [ "$(uname)" == "Darwin" ]; then
      ./node_modules/ember-cli/bin/ember test
    else
      xvfb-run ./node_modules/ember-cli/bin/ember test
    fi
    EMBER_TEST=$?
    if [ "$EMBER_TEST" == 1 ]; then
      echo "ember tests failed"
      exit $EMBER_TEST
    fi
}

cd bsrs-ember

echo $(date -u) "NPM INSTALL"
npmInstall

echo $(date -u) "EMBER TESTS"
emberTest

echo $(date -u) "BUILD SUCCESSFUL!"

exit 0