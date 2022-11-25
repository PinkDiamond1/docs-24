---
title: Locators
sidebar_label: Locators
sidebar_position: 4
---

A locator is a URL-like string used to locate a resource inside [a Kurtosis package][packages]. For example, this locator:

```
github.com/package-author/package-name/path/in/repo/some-file.star
```

references a file inside a GitHub repo called `package-name`, owned by `package-author`, that lives at the path `/path/in/repo/some-file.star` relative to the root of the repo.

Locators are used for identifying resources that will be used inside a Starlark script - namely by [`import_module`](./starlark-reference.md#import_module) and [`read_file`](./starlark-reference.md#read_file).

:::info
Only locators pointing to public GitHub repositories are currently allowed.
:::

:::info
Go developers will notice the similarities to the Go module system. The Kurtosis dependency system is inspired by Go's modules.
:::

To use any external resource in a Starlark script, the Starlark script must be
part of a [package][packages].

All locators are absolute; "relative" locators do not exist. For a Starlark script to reference a local file (i.e. one that lives next to in the filesystem), the Starlark script must use the name of the package that it lives inside.

For example, supposed we had a [Kurtosis package][packages] like so:

```
/
    kurtosis.yml
    main.star
    helpers/
        helpers.star
```

with a `kurtosis.yml` file like so:

```yaml
name: github.com/me/my-package
```

The `main.star` file would import the `helpers.star` file like so:

```python
helpers = import_module("github.com/me/my-package/helpers/helpers.star")
```

<!------------------ ONLY LINKS BELOW HERE -------------------->
[packages]: ./packages.md
