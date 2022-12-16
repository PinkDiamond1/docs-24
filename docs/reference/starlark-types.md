---
title: Starlark Types
sidebar_label: Starlark Types
sidebar_position: 4
---

This page lists out the Kurtosis types that are available in Starlark.

### PortSpec

This `PortSpec` constructor creates a PortSpec object that encapsulates information pertaining to a port. 

```python
port_spec = PortSpec(
    # The port number which we want to expose
    # MANDATORY
    number = 3000,
    
    # Transport protocol for the port (can be either "TCP" or "UDP")
    # Optional (DEFAULT:"TCP")
    transport_protocol = "TCP",

    # Application protocol for the port
    # Optional
    application_protocol = "http"
)
```
The above constructor returns a `PortSpec` object that contains port information in the form of a [future reference][future-references-reference] and can be used with 
[add_service][starlark-instructions-add-service] to create services.

<!--------------- ONLY LINKS BELOW THIS POINT ---------------------->
[future-references-reference]: ./future-references.md
[starlark-instructions-add-service]: ./starlark-instructions.md#add_service