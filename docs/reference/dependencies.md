---
title: Dependencies
sidebar_label: Dependencies
sidebar_position: 3
---

A [Kurtosis Starlark script][starlark-explainer] can depend on and use other resources, including static files and other Starlark scripts.

### The `kurtosis.yml` File
Any 

### Locators
All resources are referenced by a URL that locates a resource inside a Git repository. For example:

```
github.com/moduleAuthor/moduleName/path/in/repo/some-file.star
```

Go developers will recognize this syntax as similar to Go's import syntax; the Kurtosis dependency system takes inspiration from Go modules.

### Importing third-party Starlark scripts
Kurtosis Starlark scripts are called "modules", in keeping with Python's naming. To use a third-party Starlark script, your Starlark script must have a line like so:

```python
other_module = import_module("github.com/otherAuthor/otherName/path/in/repo/to/other.star")
```

The module URL should be adjusted appropriately for the module you are trying to reference.

This command will make all the symbols in the given module available on the `other_module` object.

### Local Dependencies

To have a 

The easiest form of 

Static file contents are imported using the `read_file` command, while other Starlark scripts are imported using the `import_module` command.

In both cases, the external file is referenced using a fully-qualified URL like so:

```
github.com/moduleAuthor/moduleName/path/in/repo/some-file.star
```

(Go developers will recognize this syntax as similar to Go's import syntax; the Kurtosis dependency system takes inspiration from Go's module system)

Note: At the moment Starlark only supports public repositories hosted on GitHub.

All import paths are URLs; there is no notion of relative imports in Kurtosis even for local paths. We made this choice to allow for performance optimizations: the result of loading any given resource can be cached based on the resource URL.

However, a `read_file` or `import_module` command alone is not enough information for Kurtosis to understand your script's dependencies because there are no relative imports. Next to your `main.star` file, you will need a `kurtosis.mod` file like so:

```yaml
module:
    # Should correspond to URL to locate this kurtosis.mod file on Github.
    # If the kurtosis.mod file lives at a subpath of the repo, that subpath should be appended here, e.g.:
    #    github.com/author/repo-name/sub/path
    name: "github.com/<your-github-org-or-user-name>/<repo-name>"
```

The module name will tell Kurtosis that any imports using that name should be resolved locally, rather than by cloning a remote Github URL.

For example, if we have a repo with these contents:

```
/
    kurtosis.mod
    main.star
    public-key.json
```


with a `kurtosis.mod` file like so:

```yaml
module:
    name: "github.com/kurtosis/example"
```

and a `main.star` like so:

```python
public_key = read_file(src_path = "github.com/kurtosis/example/public-key.json")

def main():

    print(public_key)
```

then Kurtosis will know that the contents of `public-key.json` should be retrieved from the file living right next to the `kurtosis.mod` file (due to the shared module name).

To run the module, it's enough to run the following in the directory with the `kurtosis.mod` file:

```
kurtosis run .
```

<!---------------- ONLY LINKS BELOW HERE ---------------------->
[starlark-explainer]: ../explainers/starlark.md
[starlark-reference]: ./starlark-reference.md
