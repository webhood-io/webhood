#!/usr/bin/env bash
if [ $# -eq 0 ]
  then
    tag='latest'
  else
    tag=$1
fi

# get current datetime in format ddmmyy-hhmmss
date=$(date +"%d%m%y-%H%M%S")

docker build -t ghcr.io/markusleh/headless-chrome:$tag -t ghcr.io/markusleh/headless-chrome:$date .
# if flag --push is set, push to registry
if [ "$2" == "--push" ]; then
  docker push ghcr.io/markusleh/headless-chrome:$tag
fi