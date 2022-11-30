---
title: Starlark
sidebar_label: Starlark
sidebar_position: 3
---

What is Starlark?
-----------------
[Starlark](https://github.com/bazelbuild/starlark) is a minimal programming language, halfway between a configuration language and a general-purpose programming language. It was developed by Google to do configurations for the [Bazel build tool](https://bazel.build/rules/language), and has since [been adopted by Facebook for the Buck build system as well](https://developers.facebook.com/blog/post/2021/04/08/rust-starlark-library/). Starlark's syntax is a minimal subset of of Python, with a focus on readability. [This page][starlark-differences-with-python] lists the differences between Starlark and Python.

How is Starlark used with Kurtosis?
-----------------------------------
Kurtosis uses Starlark as the language for users to define and transform environments ([enclaves][enclaves]). Users submit Starlark scripts to the Kurtosis engine, the Starlark is interpreted, and the instructions in the script are executed.

Starlark is also the way Kurtosis environment definitions are shared. If a user shares a Starlark snippet or file, the user is sharing the environment definition itself.

Why did Kurtosis choose Starlark for its environment definitions?
-----------------------------------------------------------------
Kurtosis [aims to provide a single distributed application development tool across Dev, Test, and Prod][what-is-kurtosis]. We believe that [any reusable environment definition must have certain characteristics][reusable-environment-definitions]. With these properties in mind, we searched for tools that could fulfill our needs.

We first looked at pure configuration languages like YAML, Jsonnet, Dhall, and CUE. To use them, we'd need to write our own DSL (and accompanying parser) on top of the language to do what we needed. We knew that the parameterizability requirement meant users would need conditional/looping logic, but we were unhappy with how we'd have to invent conditionals, loops, and parameters from scratch. The conditionals and parameters in the CircleCI YAML DSL seem to be a cautionary tale of starting with a declarative language and adding logic constructs later, and [others](https://github.com/tektoncd/experimental/issues/185#issuecomment-535338943) seemed [to agree](https://solutionspace.blog/2021/12/04/every-simple-language-will-eventually-end-up-turing-complete/): when dealing with configuration, start with a Turing-complete language because you will eventually need it.

We next looked at letting users declare environment definitions in their preferred general-purpose language, like Pulumi. This would require a large effort from our side to support many different SDKs, but we would do it if it was the right choice. However, we ultimately rejected this option because we realized that Kurtosis environment definitions in general-purpose programming languages:

1. Are _too_ powerful: we'd need to run user code to construct an environment, and running arbitrary user code is a security risk in one general-purpose language let alone in various.
1. Aren't friendly for the environment definition author: to make an environment definition portable, the author would have to bundle their definition inside a container. Containerization makes development more painful (the user must know about Dockerfiles, their best practices, and how to build them locally), and requires a CI job to publish the container images up to Dockerhub.
1. Aren't friendly for the environment definition consumer: a developer investigating a third-party environment definition could easily be faced with a language they're not familiar with. Worse, general-purpose languages have many patterns for accomplishing the same task, so the consumer would need to understand the class/object/function architecture.

When we discovered Starlark, the fit was obvious. Starlark:

- Is syntactically valid Python, which most developers are familiar with and which has much tooling
- [Intentionally removes many Python features][starlark-differences-with-python], to make Starlark easier to read and understand
- Has [several properties that are very useful for Kurtosis](https://github.com/bazelbuild/starlark#design-principles), thanks to Starlark's origin as a build system definition language
- [Has been around in Google since at least 2017](https://blog.bazel.build/2017/03/21/design-of-skylark.html), meaning it's well-vetted
- Is used for both Google and Facebook's build system, meaning it isn't going away any time soon
- [Is used by several other companies beyond Google and Facebook](https://github.com/bazelbuild/starlark/blob/master/users.md#users)

How is Starlark implemented at Kurtosis?
----------------------------------------
Starlark itself is very basic; Google designed it to be extended to fulfill a given usecase (e.g. the Bazel build language is actually an extension built on top of Starlark). We extended basic Starlark with several features so that it could [fulfill the properties of reusable environment definitions][reusable-environment-definitions]:

- A [list of Kurtosis-specific functions][starlark-instructions-reference] for working with an environment
- The [ability to accept parameters][run-args-reference]
- Dependencies, so Kurtosis scripts can [import other scripts][locators-reference]
- A [GitHub-based packaging system][packages-reference], so environment definitions can be shared with each other

How do I get started with Starlark?
-----------------------------------

First, install the Kurtosis CLI using [the guide here](https://docs.kurtosis.com/install).

Next, save the following to a file named `main.star`:

```py
def run(args):
    service = add_service(
        service_id = "httpd-service", 
        config = struct(
            image = "httpd:2.4.54", 
            ports = {"http" : struct(number = 80, protocol = "TCP" )}
        )
    )
    print("httpd has been added successfully")
```

:::info
A `run` method with the signature `run(args)` is necessary in standalone
starlark scripts. The argument to the method can be passed using the `--args`
flag in the CLI.

The argument to the `run` method functions the same way as it does in [packages][run-args-reference].
:::

Finally, run it using the Kurtosis CLI:

```bash
kurtosis run main.star
```

You should see output that looks like

![expected output](/img/explanations/run-output.png)

Kurtosis scripts run in three phases: 

1. The Starlark script is interpreted, and each command is pushed to a queue of instructions to execute
1. The "flattened" list of commands are validated, which allows Kurtosis to report misconfigurations like typo'd ports or IP addresses before any execution happens
1. The list of commands are executed

On the second line you can see that Kurtosis created an [enclave][enclaves] with the randomly chosen name `winter-mountain` for the script to run in.

On the third line you can see the flattened list of commands that Kurtosis validated (which only contains `add_service`).

On the fifth line you can see the output of the script.

<!--------------- ONLY LINKS BELOW HERE --------------------------->
[what-is-kurtosis]: ./what-is-kurtosis.md
[enclaves]: ./architecture.md#enclaves
[reusable-environment-definitions]: ./reusable-environment-definitions.md
[starlark-differences-with-python]: https://bazel.build/rules/language#differences_with_python

[locators-reference]: ../reference/locators.md
[packages-reference]: ../reference/packages.md
[run-args-reference]: ../reference/packages.md#arguments
[starlark-instructions-reference]: ../reference/starlark-instructions.md
