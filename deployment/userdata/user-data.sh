#!/bin/bash

#install code deploy agents
sudo yum update -y
sudo yum install ruby -y
sudo yum install wget -y
cd /home/ec2-user
wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

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

# clone code
git clone -b develop https://github.com/nphattai/chatty-backend.git
cd chatty-backend

# install dependences
yarn install

# get env from s3
aws s3 sync s3://funny-chatapp-env/development .
unzip env-file.zip
cp .env.development .env

# build app
sudo su
yarn build

#start app
yarn start
