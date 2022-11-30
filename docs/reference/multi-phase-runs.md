---
title: Multi-Phase Runs
sidebar_label: Multi-Phase Runs
---

<!-- TODO Refactor this a bit when we have a 'plan' object -->

Kurtosis environment definitions are encapsulated inside [Starlark scripts][starlark-explanation], and these scripts can be bundled into [packages][packages].

Much like Spark, Gradle, Cypress, and Flink, a multi-phase approach is used when Kurtosis runs Starlark:

<!-- TODO Add a dependency phase when we do dependency resolution before interpretation? -->
1. **Interpretation Phase:** The Starlark is uploaded to the Kurtosis engine and the Starlark code is run. Each [Starlark Kurtosis instruction][starlark-instructions] adds a step to a plan of instructions to execute, _but the instruction isn't executed yet_.
1. **Validation Phase:** The plan of instructions is validated to ensure port dependencies are referencing existing ports, container images exist, duplicate services aren't being created, etc.
1. **Execution Phase:** The validated plan of instructions is executed, one at a time.

For the user, the important thing to remember is that any value returned by a function in Starlark is not the actual value - it is a future value that Kurtosis will replace during the Execution Phase when the value actually exists.

For example:

```python
service = add_service(
    "my-service",
    config = struct(
        image = "hello-world",
    )
)
print(service.ip_address)
```

does not in fact print the actual IP address of the service, because the service does not exist during the Interpretation Phase. Instead, `service.ip_address` contains a string referencing the _future_ value of the service's IP address. Kurtosis will replace this reference everywhere it occurs during the Execution Phase:

```
> print "{{kurtosis:my-service.ip_address}}"
172.19.10.3
```

The reference string schema is undefined and subject to constant change, so users should not construct these strings themselves.

To read about why Kurtosis uses this approach, [see here][multi-phase-runs-explanation].


<!---------------- ONLY LINKS BELOW HERE ------------------------->
[starlark-explanation]: ../explanations/starlark.md
[starlark-instructions]: ./starlark-instructions.md
[packages]: ./packages.md
[multi-phase-runs-explanation]: ../explanations/why-multi-phase-runs.md
