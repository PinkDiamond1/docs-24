---
title: Multi-Phase Execution
sidebar_label: Multi-Phase Execution
---

<!-- TODO Refactor this a bit when we have a 'plan' object -->

Kurtosis environment definitions are encapsulated inside [Starlark scripts][starlark-explainer], and these scripts can be bundled into [packages][packages].

Much like PySpark, SQL, Gradle, and Cypress, a multi-phase approach is used when running a Kurtosis environment definition:

<!-- TODO Add a dependency phase when we do dependency resolution before interpretation? -->
1. **Interpretation Phase:** The Starlark is uploaded to the Kurtosis engine and the Starlark code is run. Each [Kurtosis instruction][starlark-instructions] adds a step to a plan of instructions to execute, but the instruction isn't executed yet.
1. **Validation Phase:** The plan of instructions is validated to ensure port dependencies are referencing existing ports, container images exist, duplicate services aren't being created, etc.
1. **Execution Phase:** The validated plan of instructions is executed, one at a time.

Undeniably, this approach adds complexity to the Starlark code. For example:

```python
service = add_service(
    "my-service",
    config = struct(
        image = "hello-world",
    )
)
print(service.ip_address)
```

does not in fact print the IP address of the service, because the service does not exist at time of Starlark interpretation. Instead, a string referencing the _future_ value of the service's IP address during the Execution Phase will be printed.

We chose this multi-phase approach despite its complexity because it allows us to:

- Validate the entire plan before execution, allowing us to catch errors like container image typos before executing anything
- Show the user a dry run of what will happen before executing anything (important for both introspection and security)
- Optimize performance (e.g. pulling all the container images that will be used in parallel before anything executes)

In the future, it will also allow us to:

- Give the user the power to remove and edit parts of the plan they don't like (useful when consuming third-party definitions)
- Give the user the ability to plug the plan in with the existing contents of the enclave without relying on the definition author to parameterize it
- Compile a Kurtosis plan down a declarative definition (e.g. Helm or Terraform)

<!---------------- ONLY LINKS BELOW HERE ------------------------->
[starlark-explainer]: ../explainers/starlark.md
[starlark-instructions]: ./starlark-instructions.md
[packages]: ./packages.md
