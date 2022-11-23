---
title: Glossary
sidebar_label: Glossary
sidebar_position: 1
---

<!-- NOTE TO KURTOSIS DEVS: KEEP THIS ALPHABETICALLY SORTED -->

### CLI
A command line interface, [installed by your favorite package manager](/install), which wraps an instance of the Kurtosis SDK to allow you to manipulate the contents of Kurtosis.

### Enclave
An environment, isolated from other enclaves, in which distributed systems are launched and manipulated.

### Engine
The Kurtosis engine which receives instructions via the Kurtosis SDK (e.g. "launch this service in this enclave", "create a new enclave", "destroy this enclave", etc.).

### Executable Package
A [Kurtosis package](#package) that has a `main.star` file at the root, so that it can be run directly using the Kurtosis CLI.

### Module
A single Starlark script that defines a sequence of instructions to execute inside an enclave (think "module" in the same sense as a Python module).

### Package
A directory containing a `kurtosis.yml` file and any additional modules and static files that the package needs. Also see [executable packages](#executable-package).

### Starlark
[A minimal, Python-like language invented at Google](https://github.com/bazelbuild/starlark) for configuring their build tool, Bazel.

### User Service
A container, launched inside an enclave upon a request to the Kurtosis engine, that is started from whatever image the user pleases.

<!-- NOTE TO KURTOSIS DEVS: KEEP THIS ALPHABETICALLY SORTED -->
