rem rm log.txt

rem update package dependencies
git submodule init && git submodule update
git submodule foreach git pull origin master

rem start webserver in folder and port
npl -d root="www/" port="8098" bootstrapper="script/apps/WebServer/WebServer.lua" servermode="true"
