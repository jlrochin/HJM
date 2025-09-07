import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'

import './assets/css/main.css'
import './assets/styles/driver-theme.css'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
    timeout: 5000,
    position: 'bottom-right',
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    toastDefaults: {
        success: {
            toastClassName: 'success-toast',
            bodyClassName: 'success-body'
        },
        error: {
            toastClassName: 'error-toast',
            bodyClassName: 'error-body'
        },
        warning: {
            toastClassName: 'warning-toast',
            bodyClassName: 'warning-body'
        }
    }
})

app.mount('#app')
