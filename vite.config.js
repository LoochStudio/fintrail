import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/fintrail/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'preview.html'),
        catalog: resolve(__dirname, 'catalog/index.html'),
        catalogCategory: resolve(__dirname, 'catalog/kurtki/index.html'),
        sale: resolve(__dirname, 'sale/index.html'),
        cart: resolve(__dirname, 'cart/index.html'),
        cartEmpty: resolve(__dirname, 'cart-empty/index.html'),
        orderConfirmed: resolve(__dirname, 'order-confirmed/index.html'),
        personal: resolve(__dirname, 'personal/index.html'),
        product: resolve(__dirname, 'catalog/master-hood-1510/index.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
