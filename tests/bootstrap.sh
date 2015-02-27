#!/bin/bash
cd /tmp

fail() {
    echo -e "\e[101mFAIL at line ${1}\e[49m"
    exit 1
}

#########
# TESTS #
#########

echo 'Test webino command'
webino

echo 'Test webino command welcome text'
[ -n "$(webino | grep 'Webino Development Kit')" ] || fail $LINENO

# TODO add more tests (module init/update, testing, generators, etc.)
