---
title: Locators
sidebar_label: Locators
---

A locator is a URL-like string used to locate a resource inside [a Kurtosis package][packages]. For example, this locator:

```
github.com/package-author/package-name/path/in/repo/some-file.star
```

references a file inside a GitHub repo called `package-name`, owned by `package-author`, that lives at the path `/path/in/repo/some-file.star` relative to the root of the repo.


Locators are used for identifying resources that will be used inside a Starlark script - namely by [`import_module`](./starlark-instructions.md#import_module) and [`read_file`](./starlark-instructions.md#read_file).

:::caution
A GitHub URL is **not** a valid locator, because GitHub adds extra `/blob/master` paths to the URL that don't reflect the file's path in the repo. For example, a GitHub URL of:

```
https://github.com/kurtosis-tech/kurtosis/blob/master/starlark/test.star
```

would be the following as a Kurtosis locator (dropping the `/blob/master` part):

```
https://github.com/kurtosis-tech/kurtosis/starlark/test.star
```
:::

:::info
Only locators pointing to public GitHub repositories are currently allowed.
:::

Any Starlark script that wishes to use external resources must be
a part of a [Kurtosis package][packages].

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
