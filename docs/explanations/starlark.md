---
title: Starlark
sidebar_label: Starlark
sidebar_position: 3
---

What is Starlark?
-----------------
[Starlark](https://github.com/bazelbuild/starlark) is a minimal language that sits between a configuration language and a full programming language. It was developed by Google to do configurations for the [Bazel build tool](https://bazel.build/rules/language), and has since [been adopted by Facebook for the Buck build system as well](https://developers.facebook.com/blog/post/2021/04/08/rust-starlark-library/). Starlark's syntax is a minimal subset of of Python, with a focus on readability. The [Starlark spec here](https://github.com/google/starlark-go/blob/master/doc/spec.md) covers the entire language, and [this page](https://bazel.build/rules/language#differences_with_python) lists the differences between Starlark and Python.

How is Starlark used at Kurtosis?
---------------------------------
Kurtosis uses Starlark as the language for users to define and transform [enclaves][enclaves]. Users submit Starlark programs to the Kurtosis engine, the Kurtosis engine runs the Starlark, and executes the required instructions.

Starlark is also the sharing mechanism for Kurtosis environment definitions. If a user shares a Starlark snippet or file, the user is sharing the environment definition itself.

Why did Kurtosis choose Starlark for its environment definitions?
-----------------------------------------------------------------
Kurtosis aims to provide a single distributed application development tool across Dev, Test, and Prod. We believe that any environment definition format that can do this must have [six properties][six-properties]. We have also observed that the definitions are fundamentally different between Dev, Test, and Prod: in Dev/Test, definitions should be loose, easy to modify, and only strict enough 





Kurtosis uses Starlark as the definition language for environment changes. Users write Starlark scripts representing a series of environment transformations (e.g. setting up an Elasticsearch cluster), and the transformations can be executed against any given [enclave][enclave]. Starlark scripts are also parameterizable and shareable, so users can leverage each others' work.

Why?
----
- Wrestling with the "configuration language" thing forever
- https://twitter.com/bgrant0607/status/1123621201106980864?lang=en
- We're seeing a shift away from YAML
    - E.g. Pulumi


Why did Kurtosis choose Starlark over other programming languages?
------------------------------------------------------------------
- The properties desired for Google/FB build system is very similar to what we want

- We needed a way for users to define environments that obeyed [the Six Properties of environment definitions][six-properties].
- Starlark properties (determinism, hermiticity, etc.)
- Needed a way to decouple 
- Backed by Google
- Python-like - familiar to most people

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

Finally, execute it using the Kurtosis CLI:

```bash
kurtosis exec main.star
```

You should see output that looks like

![expected output](/img/starlark/exec-output.png)

Kurtosis scripts execute in three phases: 

1. The Starlark script is interpreted, and each command is pushed to a queue of instructions to execute
1. The "flattened" list of commands are validated, which allows Kurtosis to report misconfigurations like typo'd ports or IP addresses before any execution happens
1. The list of commands are executed

On the second line you can see that Kurtosis created an [enclave][enclaves] with the randomly chosen name `winter-mountain` for the script to execute in.

On the third line you can see the flattened list of commands that Kurtosis validated (which only contains `add_service`).

On the fifth line you can see the output of the script.

<!--------------- ONLY LINKS BELOW HERE --------------------------->
[enclaves]: ./architecture.md#enclaves
[six-properties]: ./six-properties.md
