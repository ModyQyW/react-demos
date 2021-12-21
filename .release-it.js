module.exports = {
  git: {
    commitMessage: 'chore(release): v${version}',
    tagName: 'v${version}',
  },
  npm: {
    publish: false,
  },
  github: {
    release: false,
  },
  gitlab: {
    release: false,
  },
  hooks: {
    "before:init": "pnpm install && pnpm run lint",
    "after:git:release": "git push origin main:release -f"
  }
};
