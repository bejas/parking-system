# parking-system

## Usage

Install the required modules and compile

```bash
npm install
npm run compile
```

You need a file ".env" to store the JWT secret

```bash
echo "JWT_SECRET=secret" > ".env"
```

Generate HTTPS self-signed certificates

```bash
mkdir keys && cd keys
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 36
openssl rsa -in key.pem -out newkey.pem && mv newkey.pem key.pem
```

Run

```bash
npm run start
```
