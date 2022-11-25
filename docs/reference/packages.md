---
title: Packages
sidebar_label: Packages
sidebar_position: 2
---

<!-- TODO Add more information here when dependencies are specified in the kurtosis.yml -->

A Kurtosis package is a:

- A directory
- Plus all its contents
- That contains [a `kurtosis.yml` file][kurtosis-yml]
- Which names the package via a [locator][locators] that points to the directory containing the `kurtosis.yml` file

Kurtosis packages are shared simply by pushing to GitHub, in the same way as Go modules.

For example, a directory structure like so:

```
/
    kurtosis.yml
    main.star
    helpers/
        helpers.star
```

whose `kurtosis.yml` file looked like so:

```yaml
name: github.com/me/my-package
```

would be called `github.com/me/my-package`. It should get pushed to the `my-package` repo owned by the `me` user on GitHub.

Packages are referenced indirectly, as the [locators][locators] used to specify external resources in a Starlark script will contain the package name where the resource lives.

For example:

```python
helpers = import_module("github.com/me/my-package/helpers/helpers.star")
```

would be used to import the `helpers.star` file into a Starlark script.

<!-- TODO Update this when dependencies are done in the kurtosis.yml file, which would happen at dependency resolution time -->
The Kurtosis engine will automatically download dependency packages from GitHub when running a Starlark script.

### Runnable Packages
A Kurtosis package that has a `main.star` file next to its `kurtosis.yml` file is called a "runnable package". The `main.star` file of a runnable package must have a `run()` method like so:

```python
def run():
    print("Hello, world.")
```

Runnable packages can be executed directly from the CLI by passing in the package name:

```
kurtosis run github.com/me/my-package
```

This will result in a call to the `run()` function of the package's `main.star`.

To accept parameters to the `run()` function, the function should accept an `input_args` parameter:

```python
def run(input_args):
    print("Hello, " + input_args.name)
```

To pass parameters to the `run()` function, a JSON object should be given to the `--args` flag should be used when running the package:

```
kurtosis run github.com/me/my-package --args '{"name": "Joseph"}'
```

<!-------------------- ONLY LINKS BELOW HERE -------------------------->
[kurtosis-yml]: ./kurtosis-yml.md
[locators]: ./locators.md
