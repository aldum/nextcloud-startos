import { setupManifest } from '@start9labs/start-sdk'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const architectures =
  BUILD === 'x86_64' || BUILD === 'aarch64' ? [BUILD] : ['x86_64', 'aarch64']

export const manifest = setupManifest({
  id: 'nextcloud',
  title: 'Nextcloud',
  license: 'gpl',
  wrapperRepo: 'https://github.com/Start9Labs/nextcloud-startos',
  upstreamRepo: 'https://github.com/nextcloud/docker',
  supportSite: 'https://github.com/nextcloud/docker/issues',
  marketingSite: 'https://nextcloud.com',
  donationUrl: null,
  description: {
    short: 'A safe home for all your data',
    long: 'Access & share your files, calendars, contacts, mail & more from any device, on your terms.',
  },
  volumes: ['main', 'nextcloud', 'db'],
  images: {
    nextcloud: {
      arch: architectures,
      source: {
        dockerBuild: {},
      },
    } as SDKImageInputSpec,
  },
  hardwareRequirements: { arch: architectures },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
