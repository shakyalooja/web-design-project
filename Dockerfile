FROM php:8.2-apache

# Install PDO and PDO MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Safer PHP defaults: no error output to users, protected session cookie
RUN printf "display_errors=0\nlog_errors=1\nexpose_php=0\nsession.cookie_httponly=1\nsession.cookie_samesite=Lax\nsession.use_strict_mode=1\n" > /usr/local/etc/php/conf.d/security.ini
