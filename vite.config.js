import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression2'
import react from '@vitejs/plugin-react-swc'
import { constants } from './src/utils/constants'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), compression()],
	server: {
		proxy: {
			'/api': {
				target: constants.serverDevIp,
				changeOrigin: true
			}
		}
	}
})
