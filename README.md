Kurtosis Docs
=============

>📖 Kurtosis documentation site codebase.
>
>👉 Read at [docs.kurtosis.com][kurtosis-docs]

---

### Philosophy
These docs strive to follow [the Diataxis framework](https://diataxis.fr/). In our docs, our categories behave like so:

- **Tutorials:** step-by-step walkthroughs that we intend users to complete once.
- **Explanations:** long-form conveyance of knowledge that we expect the user to read once and internalize.
- **Guides:** easily-digestible step-by-step workflows that we expect the user to refer back to whenever they need to complete a workflow.
- **Reference:** easily-consumable reminders for users (e.g. API and syntax documentation, but NOT step-by-step guides!).

### Local Development
Install dependencies:
```shell
$ yarn
```

Validate and build the docs into the `build` directory (which can be served using any static content service):
```shell
$ yarn build
```

Start a local development server and open a browser window; most changes are reflected live without having to restart the server:
```shell
$ yarn start
```

Serve the `build` directory. This is useful to verifying the production build locally.
```shell
$ yarn serve
```

When your PR merges into `master`, the documentation will automatically be rebuilt and republished to [our docs page][kurtosis-docs].

<!------ ONLY LINKS BELOW HERE ------------>
[kurtosis-docs]: https://docs.kurtosis.com
