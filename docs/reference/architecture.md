---
title: Kurtosis Architecture
sidebar_label: Architecture
sidebar_position: 2
---

![Kurtosis Architecture](/img/reference/kurtosis-architecture.png)

Kurtosis At A Macro Level
-------------------------
At a macro level, Kurtosis is an engine (a set of Kurtosis servers) deployed on top of a container orchestrator (e.g. Docker, Kubernetes). All interaction with Kurtosis is done via the Kurtosis engine APIs. After the Kurtosis engine receives a request, it usually modifies some state inside the container orchestrator. Kurtosis therefore serves as an abstraction layer atop the container orchestrator, so that code written for Kurtosis is orchestrator-agnostic.

<!-- TODO Clarify what an environment is - does it include the cloud servers you're in? is an AWS environment a different thing than a GCP or heroku environment? -->
To understand what the Kurtosis engine does, we'll need to understand environments. Kurtosis' philosophy is that the distributed nature of modern software means that modern software development now happens at the environment level. Spinning up a single service container in isolation is now difficult because it has implicit dependencies on other resources like services, volume data, secrets, certificates, and network rules. Therefore, the environment - not the container - is the fundamental unit of software.

This fact becomes apparent when we look at the software development lifecycle. "Environment" used to be mean something shared, long-lived, and difficult to update: Prod or Staging. Now, the decline of on-prem hardware, rise of containerization, and availability of flexible cloud compute means Prod (and Staging, if it exists at all) live alongside countless ephemeral environments for local dev, CI validation, and QA previewing. 

To respond to this need, environments are a first-class concept in Kurtosis: easy to create, easy to inspect, easy to modify, and easy to destroy. Tactically, this means that the Kurtosis engine must make it trivial to instantiate all of an environment's resources, get information about the environment, tweak it, and dispose of it when no longer needed (for ephemeral environments like local dev). 

Thus, the Kurtosis engine job is to receive requests from the client and translate them to instructions for the underlying container orchestration engine. These requests can be simple commands that map 1:1 to instructions to the underlying container orchestrator (e.g. "add service X to environment Y"), or they can be Kurtosis-only commands that require complex interaction with the container orchestrator (e.g. "divide environment X in two with a simulated network partition").

Enclaves
--------
The environment is the foundation for Kurtosis, so Kurtosis needs a way to track environments. This is done through the concept of **enclaves**. An enclave is a house for an environment, implemented on the container orchestrator, that is managed by the Kurtosis engine. Each Kurtosis engine can manage arbitrary numbers of enclaves, limited only by the underlying hardware.

Example: Some enclaves running in a Kurtosis engine, as displayed by [the Kurtosis CLI][installation]:
```
EnclaveID                          Status
eth2                               EnclaveContainersStatus_RUNNING
go-network-partition--1659539648   EnclaveContainersStatus_RUNNING
test                               EnclaveContainersStatus_RUNNING
```

Why call these houses 'enclaves' and not 'environments'? We'll get to this later when we talk about modules.

Services
--------
Environments are composed of resources for running applications, and the principal resource in an environment is the service. Services in Kurtosis are containers that expose endpoints, and which may depend on other services (think of a Kubernetes Service if it had dependencies). Each environment can have arbitrary numbers of services.

Example: A pair of Nginx services running inside an enclave called `test`, as reported by the Kurtosis CLI:

```
Enclave ID:                           test
Enclave Status:                       EnclaveContainersStatus_RUNNING
API Container Status:                 EnclaveAPIContainerStatus_RUNNING
API Container Host GRPC Port:         127.0.0.1:50434
API Container Host GRPC Proxy Port:   127.0.0.1:50435

========================================= Kurtosis Modules =========================================
GUID   ID   Ports

========================================== User Services ==========================================
GUID               ID      Ports
test1-1659557027   test1   http: 80/tcp -> 127.0.0.1:50450
test2-1659557018   test2   http: 80/tcp -> 127.0.0.1:50442
```

SDK & Interfaces
----------------
All interaction with Kurtosis happens via API requests to the Kurtosis engine. To assist with API interaction, [we provide SDKs in various languages](https://github.com/kurtosis-tech/kurtosis-engine-api-lib) to facilitate the interaction. Anything Kurtosis is capable of doing will be available via the API and, therefore, via the SDKs.

For day-to-day operation, we provide [a CLI that wraps the SDK with easy-to-use commands][installation] (usage guide [here][cli-usage]), and we plan to have a GUI soon as well.

Modules & Packages
------------------
We mentioned earlier that enclaves house environments, and that we chose the name 'enclave' intentionally. This is because environments are fractal: Steve might deploy microservices to his Prod environment that use services in the Prod environments of Angela and Rob. The union of all three could therefore be called "the environment containing Steve's application", even while it has other environments inside it.

This becomes especially relevant with Kurtosis modules. A Kurtosis module is a portable environment-in-a-box, a package of Kurtosis SDK instructions, capable of being transferred between individuals and across machines. Two modules might be deployed in the same enclave, meaning that two disparate environments are launched in the same space. To avoid confusion, we've designated the enclave as the space in which environments get loaded in.

<!-------------- ONLY LINKS BELOW HERE --------------------->
[installation]: ./install
[cli-usage]: ./cli
