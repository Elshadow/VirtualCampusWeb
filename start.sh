#!/bin/bash

pkill -9 npl
rm log.txt

# update package dependencies
git submodule init && git submodule update
git submodule foreach git pull origin master

# start webserver in folder and port
npl -d root="www/" port="8099" bootstrapper="script/apps/WebServer/WebServer.lua" 

cat log.txt
