const rules = require("./webpack.rules");

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }]
  },
  { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
  {
    test: /\.(png|jpe?g|gif)$/i,
    use: [
      {
        loader: "file-loader",
        options: {
          publicPath: "../assets",
          outputPath: "assets"
        }
      }
    ]
  }
  // {
  //   test: /\.(gif|png|jpe?g|svg)$/i,
  //   use: [
  //     "file-loader",
  //     {
  //       loader: "image-webpack-loader",
  //       options: {
  //         bypassOnDebug: false, // webpack@1.x
  //         disable: false // webpack@2.x and newer
  //       }
  //     }
  //   ]
  // }
);

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  }
};
