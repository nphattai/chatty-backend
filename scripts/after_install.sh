#!/bin/bash

cd /home/ec2-user/chatty-backend
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.develop
aws s3 sync s3://chattyapp-env-files/backend/develop .
unzip env-file.zip
sudo cp .env.develop .env


sudo npm run stop
sudo npm install
