#!/bin/sh
set -e

CERT_DIR="/etc/nginx/certs"
CERT_KEY="${CERT_DIR}/frontend.key"
CERT_CRT="${CERT_DIR}/frontend.crt"

mkdir -p "${CERT_DIR}"

if [ ! -f "${CERT_KEY}" ] || [ ! -f "${CERT_CRT}" ]; then
  cat > /tmp/openssl.cnf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = IN
ST = Telangana
L = Hyderabad
O = Plasma Connect
OU = Dev
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
EOF

  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "${CERT_KEY}" \
    -out "${CERT_CRT}" \
    -config /tmp/openssl.cnf
fi

exec nginx -g "daemon off;"
