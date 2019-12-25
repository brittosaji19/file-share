const rules = require("./webpack.rules");

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }]
  },
  { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
  {
    test: /\.(gif|png|jpe?g|svg)$/i,
    use: [
      "file-loader",
      {
        loader: "image-webpack-loader",
        options: {
          bypassOnDebug: true, // webpack@1.x
          disable: true // webpack@2.x and newer
        }
      }
    ]
  }
);

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  }
};
