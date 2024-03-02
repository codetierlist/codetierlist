/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, {dev}) => {
        if (dev) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }

        // https://stackoverflow.com/questions/47954367/import-markdown-files-as-strings-in-next-js
        // allow import for md files
        config.module.rules.push(
            {
                test: /\.md$/,
                // This is the asset module.
                type: 'asset/source',
            }
        )

        return config;
    },
};

module.exports = nextConfig;
