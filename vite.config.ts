import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), dts()],
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			name: "Datatable",
			fileName: "vue3-bc-datatable",
			formats: ['es', 'umd'], 
		},
		rollupOptions: {
			external: ["vue"],
			output: {
				globals: {
					vue: "Vue"
				}
			}
		},
		minify: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	}
})
