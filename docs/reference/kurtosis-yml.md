---
title: kurtosis.yml
sidebar_label: kurtosis.yml
sidebar_position: 3
---

The `kurtosis.yml` file is necessary to turn a directory into [a Kurtosis package][package]. This is the spec for the `kurtosis.yml`:

<!-- TODO UPDATE THIS WHEN DEPENDENCIES GO HERE -->

```yaml
# The locator naming this package.
name: github.com/packageAuthor/packageRepoName
```

<!-- TODO delete this when packages can live in subdirectories -->
:::caution
Only packages at the root of the repo are currently supported (i.e. where the `kurtosis.yml` is at the root of the repo). Packages in subdirectories will be supported soon.
:::

<!----------------------- ONLY LINKS BELOW HERE ----------------------------->
[package]: ./packages.md
