const UglifyJSPlugin = require("uglifyjs-webpack-plugin")

module.exports = {
	entry: "./js/app.js",
	output: {
		path: __dirname + "/js",
		filename: "bundle.js"
	},
	plugins: [
		new UglifyJSPlugin()
	]
};