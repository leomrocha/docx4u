module.exports = function override(config, env) {
  // see https://github.com/electron/electron/issues/7300#issuecomment-496006781
  config.target = "electron-renderer";
  return config;
};
