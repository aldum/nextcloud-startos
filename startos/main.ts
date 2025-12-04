import { writeFile } from 'fs/promises'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import {
  getNginxFile,
  uiPort,
  pgPort,
  PGDATA,
  NEXTCLOUD_DIR as NEXTCLOUD_PATH,
} from './utils'

export const main = sdk.setupMain(async ({ effects, started }) => {
  console.info('Starting Nextcloud...')

  const store = await storeJson.read().once()
  if (!store) {
    throw Error("Store does not exist!")
  }
  const maintWindow = String(store.maintenanceWindowStart)

  const dbSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'db' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'db',
        subpath: null,
        mountpoint: '/var/lib/postgresql',
        readonly: false,
      }),
    'db-sub'
  )
  const nextcloudSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'nextcloud' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/root',
        readonly: false,
      })
      .mountAssets({
        subpath: null,
        mountpoint: '/scripts',
        type: 'directory',
      }),
    'nextcloud-sub',
  )

  // Configure nginx
  const maxBodySize = await storeJson.read((s) => s.maxBodySize).const(effects)
  // await writeFile(
  //   `${nextcloudSub.rootfs}/etc/nginx/conf.d/default.conf`,
  //   getNginxFile(maxBodySize!),
  // )

  // get interface details
  const uiInterface = await sdk.serviceInterface.getOwn(effects, 'ui').const()
  if (!uiInterface) throw new Error('interfaces do not exist')
  // @TODO check if need just domain or full urls
  const urls = uiInterface?.addressInfo?.urls

  const nextcloudEnv = {
    MAINTENANCE_WINDOW_START: maintWindow,
    TRUSTED_PROXIES: '10.0.3.0/24',
    NEXTCLOUD_TRUSTED_DOMAINS: urls?.join(' ')!,
    CONFIG_FILE: '/var/www/html/config/config.php',
    PGDATA,
    NEXTCLOUD_PATH,
    NEXTCLOUD_ADMIN_USER: 'admin',
    PASSWORD_FILE: '/root/start9/password.dat',
    INITIALIZED_FILE: '/root/initialized',
    PHP_USER_FILE: '/var/www/html/.user.ini',
    POSTGRES_HOST: 'localhost',
    POSTGRES_DB: 'nextcloud',
    POSTGRES_USER: 'nextcloud',
    POSTGRES_PASSWORD: 'nextclouddbpassword',
    EXISTING_DB: 'false',
    PHP_MEMORY_LIMIT: '1024M',
    PHP_UPLOAD_LIMIT: '20480M',
  }
  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects, started)
    .addDaemon('db', {
      subcontainer: dbSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          POSTGRES_PASSWORD: 'createastrongrandompw',
        }
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, pgPort, {
            successMessage: '',
            errorMessage: '',
          }),
      },
      requires: [],
    })
    .addDaemon('nextcloud', {
      subcontainer: nextcloudSub,
      exec: {
        env: nextcloudEnv,
        command: sdk.useEntrypoint(),
        runAsInit: true,
      },
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is not ready',
          }),
      },
      requires: ['db'],
    })
})
