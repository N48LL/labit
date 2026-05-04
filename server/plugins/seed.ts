import type { Board } from '~~/shared/types'

const DEFAULT_BOARD: Board = {
  id: 'default',
  title: 'My Homelab',
  slug: 'home',
  settings: {
    background: { type: 'none', value: '' },
    theme: { primary: 'green', neutral: 'slate' }
  },
  sections: [
    {
      id: 'section-welcome',
      title: 'Welcome',
      layout: 'grid',
      columns: 2,
      collapsible: false,
      collapsed: false,
      showTitle: false,
      widgets: [
        {
          id: 'widget-clock',
          kind: 'clock',
          span: 1,
          options: {
            format24h: false,
            showSeconds: false,
            showDate: true
          },
          plugins: {}
        },
        {
          id: 'widget-notes',
          kind: 'notes',
          span: 1,
          options: {
            content: 'Welcome to Labbit! Click the pencil icon to enter edit mode. Then right-click any service to edit, duplicate, move, or delete it.'
          },
          plugins: {}
        }
      ],
      defaults: {
        cardVariant: 'soft'
      }
    },
    {
      id: 'section-services',
      title: 'Services',
      layout: 'grid',
      columns: 3,
      collapsible: true,
      collapsed: false,
      showTitle: true,
      widgets: [
        {
          id: 'widget-portainer',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Portainer',
            description: 'Container management',
            url: 'http://localhost:9000',
            icon: 'simple-icons:portainer',
            iconType: 'iconify',
            iconBackground: true,
            openInNewTab: true,
            labels: ['label-infra']
          },
          plugins: {}
        },
        {
          id: 'widget-grafana',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Grafana',
            description: 'Monitoring dashboards',
            url: 'http://localhost:3000',
            icon: 'simple-icons:grafana',
            iconType: 'iconify',
            iconBackground: true,
            openInNewTab: true,
            labels: ['label-monitoring']
          },
          plugins: {}
        },
        {
          id: 'widget-nextcloud',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Nextcloud',
            description: 'File sync & share',
            url: 'http://localhost:8080',
            icon: 'simple-icons:nextcloud',
            iconType: 'iconify',
            iconBackground: true,
            openInNewTab: true,
            labels: []
          },
          plugins: {}
        }
      ],
      defaults: {
        cardVariant: 'outline'
      }
    },
    {
      id: 'section-media',
      title: 'Media',
      layout: 'grid',
      columns: 4,
      collapsible: true,
      collapsed: false,
      showTitle: true,
      widgets: [
        {
          id: 'widget-plex',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Plex',
            description: 'Media server',
            url: 'http://localhost:32400',
            icon: 'simple-icons:plex',
            iconType: 'iconify',
            iconBackground: false,
            openInNewTab: true,
            labels: ['label-media']
          },
          plugins: {}
        },
        {
          id: 'widget-jellyfin',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Jellyfin',
            description: 'Free media system',
            url: 'http://localhost:8096',
            icon: 'simple-icons:jellyfin',
            iconType: 'iconify',
            iconBackground: false,
            openInNewTab: true,
            labels: ['label-media']
          },
          plugins: {}
        },
        {
          id: 'widget-sonarr',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Sonarr',
            description: 'TV series manager',
            url: 'http://localhost:8989',
            icon: 'simple-icons:sonarr',
            iconType: 'iconify',
            iconBackground: false,
            openInNewTab: true,
            labels: []
          },
          plugins: {}
        },
        {
          id: 'widget-radarr',
          kind: 'service-link',
          span: 1,
          options: {
            title: 'Radarr',
            description: 'Movie manager',
            url: 'http://localhost:7878',
            icon: 'simple-icons:radarr',
            iconType: 'iconify',
            iconBackground: false,
            openInNewTab: true,
            labels: []
          },
          plugins: {}
        }
      ],
      defaults: {
        cardVariant: 'subtle'
      }
    }
  ],
  labels: [
    { id: 'label-infra', name: 'Infra', color: 'blue' },
    { id: 'label-monitoring', name: 'Monitoring', color: 'amber' },
    { id: 'label-media', name: 'Media', color: 'purple' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export default defineNitroPlugin(async () => {
  const boards = await listBoards()
  if (boards.length > 0) return

  console.log('[labbit] No boards found, creating default board...')
  await writeBoard(DEFAULT_BOARD)
  console.log('[labbit] Default board created.')
})
