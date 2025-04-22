/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
    });
    config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
    ],
  },

};

export default nextConfig;
