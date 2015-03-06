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

echo 'Test webino module development'
# TODO use WebinoSkeletonModule instead
module=WebinoDev
cd /tmp && git clone https://github.com/webino/${module}.git
cd /tmp/${$module} && webino init && webino test && webino analyze && webino api

# TODO add more tests (module init/update, testing, generators, etc.)
