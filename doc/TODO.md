
## Links

### nextcloud

* https://github.com/linuxserver/docker-nextcloud
  * // dockerTag: "linuxserver/nextcloud:30.0.11-previous"
* https://hub.docker.com/_/nextcloud/tags *
  https://github.com/nextcloud/docker/blob/32ff0009669d4a63671e6dff0bb137357b9c0a2d/30/fpm/Dockerfile
  *
  https://github.com/nextcloud/docker/commit/02fc45a96e52b11b07e37a7f3c44ce599d0f0915
  *
  https://github.com/nextcloud/docker/tree/02fc45a96e52b11b07e37a7f3c44ce599d0f0915/30/fpm-alpine

### psql

* https://hub.docker.com/_/postgres/tags *
  https://hub.docker.com/layers/library/postgres/15.15-bookworm/images/sha256-4b26f516dae03565014c4f1b748315754b1aaa7eebc2b0b70d7916d63a92e2f0

## TODO

Create a transitional 0.4.0 version, not deviating in software versions from the
latest 0.3.5.1 package (`nextcloud:30.0.11-fpm` ; pg `15` as present in bookworm
repos; PHP 8.3 from the base image `php:8.3-fpm-bookworm` )

#### Scenario A

Keep the docker build and adapt existing code.

#### Scenario B

Redo with proper multi-container. Move as few parts as possible on the
application side, but since the packaging has to be redone anyway, take
advantage of the upgrade and move to alpine now? With LSIO.

### manifest

* images
* docs

### docs

### main

#### translate the init (nextcloud-init)

* env is passed in daemons [5]
* cleanup in preInstall/init [12-13]
* postgres init as an init script [17-21, 29-32]
* started as daemon [25]
* nextcloud init as an init script [36-42, 56]
  * cron - why was this duplicated, the image already did this
  ```shell
  # Setup Cron
  echo "*/5 * * * * www-data /usr/local/bin/php -f /var/www/html/cron.php" > /etc/cron.d/my-cron \
    && chmod 0644 /etc/cron.d/my-cron \
    && touch /var/log/cron.log
  ```
* install default apps - action? [46-47]
* actions, to be run on install
  * missing indices [50]
  * maintenance:repair migrations [53]

#### health

* check-web.sh -> healthCheck

#### mounts

* /root
* /var/www/html
* /var/lib/postgresql
* ? /mnt/cert

### config

#### env

```sh
ENV POSTGRES_DB=nextcloud
ENV POSTGRES_USER=nextcloud
ENV POSTGRES_PASSWORD=nextclouddbpassword
ENV POSTGRES_HOST=localhost
ENV EXISTING_DB=false

ENV PHP_MEMORY_LIMIT=1024M
ENV PHP_UPLOAD_LIMIT=20480M
```

#### file models

* nginx.conf ?
* $CONFIG_FILE
  * `/var/www/html/config/config.php`
  * `/config/www/nextcloud/config/config.php`
* $PHP_USER_FILE
  * `/var/www/html/.user.ini`
  * `/config/php/php-local.ini`

### actions

Mostly done?

* disable-maintenance-mode.sh
* disable-unstable-apps.sh
* download-models.sh
* index-memories.sh
* places-setup.sh
* reset-pass.sh

### backup
