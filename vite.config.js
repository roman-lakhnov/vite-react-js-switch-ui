import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression2'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), compression()]
})
