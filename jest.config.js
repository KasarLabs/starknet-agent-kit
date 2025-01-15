module.exports = {
    verbose: true,
    testEnvironment: 'node',
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    rootDir: ".",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    moduleNameMapper: {
        "^dist/lib/constant$": "<rootDir>/src/lib/utils/constants/constant",
        "^dist/(.*)$": "<rootDir>/src/$1",
        "^src/(.*)$": "<rootDir>/src/$1"
    }
}