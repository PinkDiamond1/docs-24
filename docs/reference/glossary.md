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

### Module
A set of instructions to the Kurtosis engine, packaged as a Docker image, run inside an enclave (more information [here](/modules)).

### User Service
A container, launched inside an enclave upon a request to the Kurtosis engine, that is started from whatever image the user pleases.

<!-- NOTE TO KURTOSIS DEVS: KEEP THIS ALPHABETICALLY SORTED -->
