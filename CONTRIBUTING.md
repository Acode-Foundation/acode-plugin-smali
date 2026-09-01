# Contributing

## Setup and tests

Install the locked development dependencies with `npm ci`, then run the test
suite with `npm test`. Tests build the production bundle first so the packaged
runtime compatibility checks always use current output.

## Local development

Run `npm run dev` to watch the bundle and serve the completed plugin archive
over local HTTP. The backward-compatible `npm run start-dev` command does the
same thing. After the first successful build, the command prints the exact
`http://<address>:5500/dist.zip` URL.

Use `npm run build` for a one-time development build and
`npm run build-release` for the minified production bundle.

## Generated artifacts

Webpack writes `dist/main.js`, and the packaging step atomically creates
`dist.zip`. Both outputs are ignored by Git and should be rebuilt rather than
committed.

Before submitting a change, run:

```sh
npm test
npm run build-release
unzip -t dist.zip
git diff --check
```
