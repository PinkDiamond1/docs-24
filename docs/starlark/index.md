---
title: Starlark
sidebar_label: Introduction
---

:warning: **Starlark at Kurotsis is in an alpha state. Message us on discord [here](https://discord.com/channels/783719264308953108/783719264308953111) in case you run into problems.**

### What is Starlark?

Starlark is a programming language similar to Python that was developed
by Google to do configurations for the [Bazel build tool](https://bazel.build/rules/language).

Starlark, though very similar to Python, differs from Python in certain ways that make it hermetic & deterministic. The Starlark spec [here](https://github.com/google/starlark-go/blob/master/doc/spec.md) covers the entire language.

In this [page](https://bazel.build/rules/language#differences_with_python) the
reader can see a list of differences to Python.

### Why Kurtosis Chose Starlark over other programming languages?

The reason Kurtosis chose Starlark is:

1. Minimal, meaning it's difficult to write complex code, meaning it’s easy to read
2. Guaranteed to have finite execution as there are no infinite loops or recursion
3. Safe (user can't access network, OS, filesystem, etc. by default) so untrusted code can be run
4. Deterministic - the same parameters to the same program are guaranteed to give the same results (even down to the dict iteration order being deterministic)

### How do I get started with Starlark?

First need to install the Kurtosis CLI using the guide [here](https://docs.kurtosis.com/install).

To run httpd via Starlark, save the following to a file with a called `main.star`

```py
service = add_service(
    service_id = "httpd-service", 
    config = struct(
        image = "httpd:2.4.54", 
        ports = {"http" : struct(number = 80, protocol = "TCP" )}
    )
)
print("httpd has been added successfully")
```

Execute it using the `kurtosis-cli`

```bash
kurtosis exec main.star
```

You should see output that looks like

![expected output](/static/img/starlark/exec-output.png)