---
title: The Six Properties
sidebar_label: The Six Properties
sidebar_position: 3
---

There are many tools for defining environments: Bash/Python scripts, Ansible, Docker Compose, Helm, Terraform, etc. These tools have varying utility depending on whether they're being used in Dev, Test, or Prod. Kurtosis believes that any environment definition tool must enable six properties in order to be useful across Dev, Test, and Prod:

1. **Composability:** The user should be able to combine two or more environment definitions to form a new one (e.g. Postgres + Elasticsearch).
1. **Decomposability:** The user should be able to take an existing environment definition and strip out the parts they're not interested in to form a smaller environment definition (e.g. take the large Prod environment definition and instantiate only a small portion of it).
1. **Safety:** The user should be able to know whether the environment definition will work before instantiating it (analogous to type-checking - e.g. do all the ports match up, do the IP addresses match up, are the container images available, etc.)
1. **Parameterizability:** An environment definition should be able to accept parameters (e.g. define the desired number of Elasticsearch nodes)
1. **Pluggability of Data:** The data used across Dev, Test, and Prod varies so widely that the user should be able to configure which data to use.
1. **Portability:** An environment definition author should be able to share their work and be confident that it can be used.

Kurtosis is designed to fulfill all six properties.
