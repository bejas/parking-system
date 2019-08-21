#!/bin/bash

cd server
npm install
npm run compile
echo "JWT_SECRET=secret" > ".env"
npm run start &

cd ../client
ng serve -o
