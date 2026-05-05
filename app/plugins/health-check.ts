import HealthDot from '~/components/plugins/HealthDot.vue'
import HealthDotSettings from '~/components/plugins/HealthDotSettings.vue'

export default defineNuxtPlugin(() => {
  const { register } = usePluginRegistry()

  register({
    id: 'health-check',
    label: 'Health Check',
    icon: 'i-lucide-activity',
    defaultPosition: 'top-left',
    defaultConfig: {
      intervalSeconds: 30,
      showLatency: false
    },
    compatibleWith: ['service-link'],
    component: HealthDot,
    settingsComponent: HealthDotSettings
  })
})
