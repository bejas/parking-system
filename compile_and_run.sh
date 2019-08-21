#!/bin/bash

cd server
npm install
npm run compile
echo "JWT_SECRET=secret" > ".env"
mkdir data
npm run start &

cd ../client
npm install
ng serve -o
