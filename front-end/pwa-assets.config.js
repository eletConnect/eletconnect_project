import {
    defineConfig,
    minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
    headLinkOptions: {
        preset: '2023',
    },
    preset,
    images: ['/favicon.ico', '/logo192.png', '/logo512.png'],
})
