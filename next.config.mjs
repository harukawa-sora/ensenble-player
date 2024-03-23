/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
  
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          fs: false,
        };
      }

      config.module.rules.push({
        test: /\.(wav)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            publicPath: `/_next/static/sounds/`,
            outputPath: `${isServer ? "../" : ""}static/sounds/`,
          },
        },
      });
      return config;
    },
};
export default nextConfig;
