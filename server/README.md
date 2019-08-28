# parking-system

## Server

HTTP REST server + MongoDB (Mongoose) + Express

## Installation

Install the required modules and compile

```bash
npm install
npm run compile
```

You need a ".env" file to store the JWT secret

```bash
echo "JWT_SECRET=secret" > ".env"
```

Generate HTTPS self-signed certificates (if you want to use HTTPS)

```bash
mkdir keys && cd keys
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 36
openssl rsa -in key.pem -out newkey.pem && mv newkey.pem key.pem
```

## Usage

Run

```bash
npm run start
```
