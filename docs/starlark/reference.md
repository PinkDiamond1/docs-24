---
title: Starlark Reference Guide
sidebar_label: Reference
---

### add_service

The `add_service` instruction allows you to add a service to the Kurtosis enclave within which the script executes. The add service instruction
looks like

```py
service = add_service(
# The service id of the service being created, you can use this in the future to reference in facts & waits and other parts of your Starlark code. Mandatory
    service_id = "example-datastore-server-2"
	config = struct(
# The name of the container image that Kurtosis should use when creating the service’s container. Mandatory
		image = "kurtosistech/example-datastore-server",
# The ports that the container will be listening on, identified by a user-friendly ID that can be used to select the port again in the future. Optional
		used_ports={
			"grpc": struct(
				number=1234,
				protocol="TCP"
			)
		},
# Kurtosis allows you to specify gzipped TAR files that Kurtosis will decompress and mount at locations on your service containers. These “files artifacts” will need to have been stored in Kurtosis beforehand using methods like upload_files, render_templates, store_files_from_service etc. Optional       
		files_artifact_mount_dirpaths={
			"file_1": "path/to/file/1",
			"file_2": "path/to/file/2"
		},
# CMD statement hardcoded in their Dockerfiles might not be suitable for what you need. This attribute allows you to override these statements when necessary. Optional
        cmd_args=[
            "bash",
            "sleep",
            "99"
		],
# ENTRYPOINT statement hardcoded in their Dockerfiles might not be suitable for what you need. This attribute allows you to override these statements when necessary. Optional
		entry_point_args=[
			"127.0.0.0",
			1234
		],
# Defines environment variables that should be set inside the Docker container running the service. This can be necessary for starting containers from Docker images you don’t control, as they’ll often be parameterized with environment variables. Optional
		env_vars={
			"VAR_1": "VALUE_1",
			"VAR_2": "VALUE_2"
		},
# The placeholder string used within `entry_point_args`, `cmd_args`, and `env_vars` that gets replaced with the private IP address of the container inside Docker/Kubernetes before the container starts. This defaults to `KURTOSIS_IP_ADDR_PLACEHOLDER` if this isn't set. The user needs to make sure that they provide the same placeholder string for this field that they use in `entry_point_args`, `cmd_args`, and `env_vars`. Optional
        private_ip_address_placeholder = "KURTOSIS_IP_ADDRESS_PLACEHOLDER"
	)
)
```

Note that the `add_service` instruction takes two arguments `service_id` and
`config`, you don't have to name the arguments. The arguments have been named
in the example for clarity.

The `add_service` has a return value of type `service`. You can use it like below

```py
print(service.ip_address)
print(service.ports["grpc"].number)
print(service.ports["grpc"].protocol)
```

Referring to a services IP address might be useful if one of the upcoming services depends on the current services IP address, say one is a boot node
and the other is a child node.

### remove_service

The `remove_service` instruction allows you to remove a function from the enclave in which the instruction executes in.

```py
remove_service(
    # The service id of the service to be removed
    service_id = service_id
)
```

Note that the `remove_service` instruction takes one argument `service_id`, you don't have to name the . The arguments have been named
in the example for clarity.

### exec

The `exec` instruction allows you to execute commands on a given service. It looks like

```py
exec(service_id = service_id, cmd_args = ["echo", "hello"])
exec(service_id = service_id, cmd_args = ["echo", "hello"], expected_exit_code = 0)
```

The `service_id` and `cmd_args` are required arguments. The `expected_exit_code` is an optional argument that defaults to 0. If the 
`exec` leads to any thing other than the `expected_exit_code` you'll get
 an execution error in Starlark.