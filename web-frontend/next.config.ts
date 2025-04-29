import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["res.cloudinary.com"],
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: process.env.BACKEND_URL || 'http://localhost:3001/:path*',
			},
		];
	},
};

export default nextConfig;
