Kurtosis Docs
=============

>📖 Kurtosis documentation site codebase.
>
>👉 Read at [docs.kurtosis.com](https://docs.kurtosis.com)

---

### Philosophy
These docs strive to follow [the Diataxis framework](https://diataxis.fr/). In our docs, our categories behave like so:

- **Tutorials:** step-by-step walkthroughs that we intend users to complete once.
- **Explanations:** long-form conveyance of knowledge that we expect the user to read once and internalize.
- **Guides:** easily-digestible step-by-step workflows that we expect the user to refer back to whenever they need to complete a workflow.
- **Reference:** easily-consumable reminders for users (e.g. API and syntax documentation, but NOT step-by-step guides!).

### Installation

```shell
$ yarn
```

### Local Development

```shell
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```shell
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve

```shell
$ yarn serve
```

This command serves `build` directory. This is useful to verifying the production build locally.
