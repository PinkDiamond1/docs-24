---
title: Kurtosis Engine API
sidebar_label: Kurtosis Engine
hide_table_of_contents: true
---

This documentation describes how to interact with the Kurtosis API from within a testnet. It includes information about starting services, stopping services, repartitioning the network, etc. These objects are particularly useful for writing tests, where pre-test setup involves creating an enclave. Note that any comments specific to a language implementation will be found in the code comments.

KurtosisContext
---------------
A connection to a Kurtosis engine, used for manipulating enclaves.

### `createEnclave(EnclaveID enclaveId, boolean isPartitioningEnabled) -> [EnclaveContext][enclavecontext] enclaveContext`
Creates a new Kurtosis enclave using the given parameters.

**Args**
* `enclaveId`: The ID to give the new enclave.
* `isPartitioningEnabled`: If set to true, the enclave will be set up to allow for repartitioning. This will make service addition & removal take slightly longer, but allow for calls to [EnclaveContext.repartitionNetwork][enclavecontext_repartitionnetwork].

**Returns**
* `enclaveContext`: An [EnclaveContext][enclavecontext] object representing the new enclave.

### `getEnclaveContext(EnclaveID enclaveId) -> [EnclaveContext][enclavecontext] enclaveContext`
Gets the [EnclaveContext][enclavecontext] object for the given enclave ID.

**Args**
* `enclaveId`: The ID of the enclave to retrieve the context for.

**Returns**
* `enclaveContext`: The [EnclaveContext][enclavecontext] representation of the enclave.

### `getEnclaves() -> Set<EnclaveID> enclaveIds`
Gets the IDs of the enclaves that the Kurtosis engine knows about.

**Returns**
* `enclaveIds`: A set of the enclave IDs that the Kurtosis is aware of.

### `stopEnclave(EnclaveID enclaveId)`
Stops the enclave with the given ID, but doesn't destroy the enclave objects (containers, networks, etc.) so they can be further examined.

**NOTE:** Any [EnclaveContext][enclavecontext] objects representing the stopped enclave will become unusable.

**Args**
* `enclaveId`: ID of the enclave to stop.

### `destroyEnclave(EnclaveID enclaveId)`
Stops the enclave with the given ID and destroys the enclave objects (containers, networks, etc.).

**NOTE:** Any [EnclaveContext][enclavecontext] objects representing the stopped enclave will become unusable.

**Args**
* `enclaveId`: ID of the enclave to destroy.

### `clean(boolean shouldCleanAll) -> Set<EnclaveID> RemovedEnclaveIds`
Destroys enclaves in the Kurtosis engine.

**Args**
* `shouldCleanAll`: If set to true, destroys running enclaves in addition to stopped ones.

**Returns**
* `RemovedEnclaveIds`: A set of the removed enclave IDs.


<!-- TODO Make the function definition not include args or return values, so we don't get these huge ugly links that break if we change the function signature -->
<!-- TODO make the reference names a) be properly-cased (e.g. "Service.isAvailable" rather than "service_isavailable") and b) have an underscore in front of them, so they're easy to find-replace without accidentally over-replacing -->

[enclavecontext]: /api/kurtosis-core#enclavecontext
[enclavecontext_repartitionnetwork]: /api/kurtosis-core#repartitionnetworkmappartitionid-setserviceid-partitionservices-mappartitionid-mappartitionid-partitionconnectionpartitionconnection-partitionconnections-partitionconnectionpartitionconnection-defaultconnection