#!/bin/bash

# clear privious environment
cd /home/ec2-user/chatty-backend
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.development

# get environment from s3
aws s3 sync s3://funny-chatapp-env/development .
unzip env-file.zip
cp .env.development .env

# stop current process
sudo npm run stop

# install deps
sudo npm install
