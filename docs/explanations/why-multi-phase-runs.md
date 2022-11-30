---
title: Why Multi-Phase Runs?
sidebar_label: Why Multi-Phase Runs?
sidebar_position: 7
---

Kurtosis runs its [Starlark environment definitions][starlark-explanation] in [multiple phases][multi-phase-execution-reference].

This adds complexity. For example:

```python
service = add_service(
    "my-service",
    config = struct(
        image = "hello-world",
    )
)

if service.ip_address == "1.2.3.4":
    print("IP address matched")
```

The `if` statement will never evaluate to true because `service.ip_address` 

<!-- TODO Maybe move this to its own explanation section??
We chose this multi-phase approach despite its complexity because it allows us to:

- Validate the entire plan before execution, allowing us to catch errors like container image typos before executing anything
- Show the user a dry run of what will happen before executing anything (important for both introspection and security)
- Optimize performance (e.g. pulling all the container images that will be used in parallel before anything executes)

In the future, it will also allow us to:

- Give the user the power to remove and edit parts of the plan they don't like (useful when consuming third-party definitions)
- Give the user the ability to plug the plan in with the existing contents of the enclave without relying on the definition author to parameterize it
- Compile a Kurtosis plan down a declarative definition (e.g. Helm or Terraform)
-->


<!----------------- ONLY LINKS BELOW HERE ----------------->
[starlark-explanation]: ./starlark-explanation.md
[multi-phase-execution-reference]: ../reference/multi-phase-execution.md

