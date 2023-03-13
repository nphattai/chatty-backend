#!/bin/bash

# install nodejs
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs
node -e "console.log('Running Node.js ' + process.version)"

# install git
sudo yum install git -y

#install pm2
npm install -g pm2

# install yarn
npm i -g yarn
yarn --version

cd /home/ec2-user

git clone -b refactor-terraform https://github.com/nphattai/chatty-backend.git # replace this github url with your url of your own project
cd chatty-backend # set your project name
yarn install
aws s3 sync s3://funny-chatapp-env/development . # update with your s3 bucket
unzip env-file.zip
cp .env.development .env
sudo su
yarn build
yarn start
