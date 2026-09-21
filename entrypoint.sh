#!/bin/sh
set -e

echo "Iniciando aplicación..."

mkdir -p /data/uploads
chown -R mrmenusftp:mrmenusftp /data/uploads

exec /usr/bin/supervisord -c /etc/supervisord.conf