import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
//import primevue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes';
import 'primeicons/primeicons.css'
import './style.css'
import 'primeflex/primeflex.css'

//import font awesome
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(fas, far, fab)
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
})
app.use(createPinia())
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
