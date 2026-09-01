const { defineConfig } = require("jest");

module.exports = defineConfig({
	collectCoverage: true,
	collectCoverageFrom: ["source/**/*.js"]
});
