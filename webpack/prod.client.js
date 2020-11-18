const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
//	const TerserPlugin = require('terser-webpack-plugin');
//	const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const rootPath = path.resolve(__dirname, '../');
const assetPath = path.resolve(rootPath, './dist/client');

const generatedIdent = (name, localName, lr) => {
	const b = Buffer.from(lr).toString('base64');
	// eslint-disable-next-line space-infix-ops
	return `${name}__${localName}--${b.substring(b.length - 12, b.length - 3)}`;
};

module.exports = {
	context: path.resolve(__dirname, '..'),
	name: 'client',
	target: 'web',
	mode: 'production',

	entry: {
		main: [
			'./src/styled/fonts.css',
			'./src/client/index.js'
		],
	},

	output: {
		filename: '[name].[contenthash].js',
		chunkFilename: '[name].[contenthash].js',
		path: assetPath,
		publicPath: '/',
	},

	module: {
		rules: [

			//	{
			//		test: require.resolve('../node_modules/graphiql/esm/components/QueryEditor.js'),
			//		use: [{
			//			loader: 'imports-loader',
			//			options: {
			//				type: 'module',
			//				imports: ['default process/browser process'],
			//			},
			//		}],
			//	},

			{
				type: 'javascript/auto',
				test: /\.mjs$/,
				use: [],
				include: /node_modules/,
			},

			{
				test: /\.(graphql|gql)$/,
				exclude: /node_modules/,
				loader: 'graphql-tag/loader',
			},

			// ====================================================================================

			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					babelrc: false,
					configFile: path.resolve(rootPath, 'babel.config.js'),
				},
			},

			// ====================================================================================

			{
				test: /\.(css)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
						options: {
							modules: {
								mode: 'local',
								getLocalIdent: (loaderContext, localIdentName, localName) => {
									const lr = loaderContext.resourcePath;
									if (path.basename(lr).indexOf('global.scss') !== -1) {
										return localName;
									}
									if (path.basename(lr).indexOf('graphiql.css') !== -1) {
										return localName;
									}
									return generatedIdent(
										path.basename(lr).replace(/\.[^/.]+$/, ''),
										localName,
										lr,
									);
								},
							},
							importLoaders: 2,
						},
					},
					{
						loader: 'resolve-url-loader',
					},
					{
						loader: 'postcss-loader',
					},
				],
			},

			// ====================================================================================

			{
				test: /\.(scss)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
						options: {
							modules: {
								mode: 'local',
								getLocalIdent: (loaderContext, localIdentName, localName) => {
									const lr = loaderContext.resourcePath;
									if (path.basename(lr).indexOf('global.scss') !== -1) {
										return localName;
									}
									return generatedIdent(
										path.basename(lr).replace(/\.[^/.]+$/, ''),
										localName,
										lr,
									);
								},
							},
							importLoaders: 2,
						},
					},
					{
						loader: 'resolve-url-loader',
					},
					{
						loader: 'postcss-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								outputStyle: 'compressed',
							},
						},
					},
				],
			},

			// ====================================================================================

			{
				test: /\.(gif|jpg|svg|png|ico|woff|woff2|ttf)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							esModule: false,
						},
					},
				],
			},
		],
	},

	performance: {
		hints: false,
	},

	optimization: {
		minimize: true,
		//  minimizer: [
		//  	new TerserPlugin({
		//  		terserOptions: {
		//  			output: {
		//  				comments: false,
		//  			},
		//  			compress: {
		//  				drop_console: true,
		//  			},
		//  		},
		//  	}),
		//  ],
		//	splitChunks: {
		//		chunks: 'all',
		//		cacheGroups: {
		//			defaultVendors: {
		//				test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
		//				name: 'vendor',
		//				chunks: 'all',
		//			},
		//		},
		//	},
		//	https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
		moduleIds: 'deterministic',
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: Infinity,
			//	minSize: 20000,
			minSize: 64000,
			cacheGroups: {
				defaultVendors: {
					test: /\/node_modules\//,
					name(module) {
						const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
						return `npm.${packageName.replace('@', '')}`;
					},
				},
			},
		},
		//	runtimeChunk: {
		//		name: 'manifest',
		//	},
		//	splitChunks: {
		//		minSize: 10000,
		//		maxSize: 250000,
		//		cacheGroups: {
		//			defaultVendors: {
		//				test: /node_modules/,
		//				chunks: 'all',
		//				enforce: true,
		//			},
		//		},
		//	},
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css', '.scss', '.mjs'],
		//	fallback: { 
		//		'assert': require.resolve('assert/'),
		//	}
	},

	plugins: [
		new ForkTsCheckerWebpackPlugin(),
		new CopyPlugin({
			patterns: [{ from: './**', to: assetPath, context: './public' }],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css'
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		//	new webpack.DefinePlugin({}),
		new LoadablePlugin(),
		//	new BundleAnalyzerPlugin({
		//		analyzerMode: "static",
		//		openAnalyzer: false,
		//	}),
	],
};
