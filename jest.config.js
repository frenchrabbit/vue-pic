module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  collectCoverage: true,
  collectCoverageFrom: ['plugin/*.{ts,vue}'],
  coverageReporters: ['text-summary', 'lcov', 'cobertura'],
}
