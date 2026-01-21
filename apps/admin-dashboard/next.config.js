/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gpt-ui/schema', '@gpt-ui/cache', '@gpt-ui/llm-engine', '@gpt-ui/ui-runtime'],
}

module.exports = nextConfig