---
title: Starlark Introduction
sidebar_label: Starlark Introduction
---

:warning: **Starlark at Kurtosis is in an alpha state. Message us on discord [here](https://discord.com/channels/783719264308953108/783719264308953111) in case you run into problems.**

### What is Starlark?

Starlark is a programming language similar to Python that was developed by Google to do configurations for the [Bazel build tool](https://bazel.build/rules/language).

Though very similar to Python, Starlark removes many Python features so that it's hermetic (meaning each Starlark script is self-contained), deterministic (meaning the same input gives the same output), and easy-to-read. The [Starlark spec here](https://github.com/google/starlark-go/blob/master/doc/spec.md) covers the entire language, and [this page](https://bazel.build/rules/language#differences_with_python) lists the differences between Starlark and Python.

### How is Starlark used at Kurtosis?

Kurtosis uses Starlark as the definition language for environment changes. Users write Starlark scripts representing a series of environment transformations (e.g. setting up an Elasticsearch cluster), and the transformations can be executed against any given [enclave][enclave]. Starlark scripts are also parameterizable and shareable, so users can leverage each others' work.

### Why did Kurtosis choose Starlark over other programming languages?

Kurtosis chose Starlark to define environment changes because it's:

1. Minimal, meaning it's difficult to write complex code, meaning it’s easy to read
2. Guaranteed to have finite execution as the Starlark interpreter forbids infinite loops and recursion
3. Safe (user can't access network, OS, filesystem, etc. by default) so untrusted code can be run
4. Deterministic - the same parameters to the same program are guaranteed to give the same results (even down to the dict iteration order being deterministic)

### How do I get started with Starlark?

First, install the Kurtosis CLI using [the guide here](https://docs.kurtosis.com/install).

Next, save the following to a file named `main.star`:

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

Finally, run it using the Kurtosis CLI:

```bash
kurtosis run main.star
```

You should see output that looks like

![expected output](/img/starlark/exec-output.png)

Kurtosis scripts runs in three phases: 

1. The Starlark script is interpreted, and each command is pushed to a queue of instructions to execute
1. The "flattened" list of commands are validated, which allows Kurtosis to report misconfigurations like typo'd ports or IP addresses before any execution happens
1. The list of commands are executed

On the second line you can see that Kurtosis created an [enclave][enclave] with the randomly chosen name `winter-mountain` for the script to run in.

On the third line you can see the flattened list of commands that Kurtosis validated (which only contains `add_service`).

On the fifth line you can see the output of the script.

<!--------------- ONLY LINKS BELOW HERE --------------------------->
[enclave]: /docs/reference/architecture.md#enclaves
