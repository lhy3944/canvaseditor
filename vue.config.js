const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer: {
    host: "localhost",
  },

  transpileDependencies: [
    'quasar'
  ],

  lintOnSave: false,

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  }
});
