#!/bin/sh
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

if [ ! -f /var/www/vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts
fi

exec "$@"