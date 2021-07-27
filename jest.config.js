module.exports = {
    // testEnvironment: 'jest-environment-jsdom-fifteen',
    // "verbose": true,
    // "bail": true,
    "collectCoverage": true,
    "coverageDirectory": "public/coverage",
    "coverageReporters": [
      "html",
      "lcov",
      "text"
    ],
    "collectCoverageFrom": [
      "lib/**/*.js"
    ],
    moduleDirectories: [ // https://testing-library.com/docs/react-testing-library/setup/#configuring-jest-with-test-utils
      'node_modules',
    //   'utils',
      __dirname,
    ],
  }