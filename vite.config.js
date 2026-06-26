import { defineConfig } from 'vite'
import { resolve } from 'path'

const base = process.env.NODE_ENV === 'production' ? '/fintrail/' : '/'

// Vite processes <script src>, <link href>, <img src>, <use href> automatically,
// but leaves <a href> navigation links as-is. This plugin rebases them in production.
const rebaseNavLinks = {
  name: 'rebase-nav-links',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      if (base === '/') return html
      return html
        .replace(/(<a\b[^>]*?\shref=")\/(?!\/)/g, `$1${base}`)
        .replace(/(<form\b[^>]*?\saction=")\/(?!\/)/g, `$1${base}`)
    },
  },
}

export default defineConfig({
  base,
  plugins: [rebaseNavLinks],
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
        personalOrders: resolve(__dirname, 'personal/orders/index.html'),
        personalOrderDetail: resolve(__dirname, 'personal/orders/detail/index.html'),
        personalReviews: resolve(__dirname, 'personal/reviews/index.html'),
        personalLoyalty: resolve(__dirname, 'personal/loyalty/index.html'),
        personalLoyaltyOperations: resolve(__dirname, 'personal/loyalty/operations/index.html'),
        personalSupport: resolve(__dirname, 'personal/support/index.html'),
        personalSettings: resolve(__dirname, 'personal/settings/index.html'),
        product: resolve(__dirname, 'catalog/master-hood-1510/index.html'),
        search: resolve(__dirname, 'search/index.html'),
        compare: resolve(__dirname, 'compare/index.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
