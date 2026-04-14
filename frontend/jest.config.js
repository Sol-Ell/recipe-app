module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  moduleNameMapper: {
    // 处理 CSS 和图片，防止报错
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};