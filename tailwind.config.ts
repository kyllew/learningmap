import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aws-orange': '#ff9900',
        'aws-blue': '#0073bb',
        'aws-teal': '#1dc7ea',
      },
    },
  },
  plugins: [],
}
export default config 