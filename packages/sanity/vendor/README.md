# Vendored packages

`groq-compiler-0.1.0.tgz` is built with `npm pack` from [groq-compiler](https://github.com/josemanosalvas/groq-compiler) until that package is published to npm. Replace the `file:` dependency in `packages/sanity/package.json` with the registry version then, and delete this folder.
