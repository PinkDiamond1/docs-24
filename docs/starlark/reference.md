---
title: Starlark Reference Guide
sidebar_label: Reference
---
:warning: **Starlark at Kurotsis is rapidly evolving, this page might not always reflect the truth. We encourage users to messages us [here](https://discord.com/channels/783719264308953108/783719264308953111) in case they run into any problems.**

## Instructions

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
# The service id of the service to be removed. Mandatory
    service_id = service_id
)
```

Note that the `remove_service` instruction takes one argument `service_id`, you don't have to name it. The arguments have been named
in the example for clarity.

### exec

The `exec` instruction allows you to execute commands on a given service. It looks like

```py
exec(service_id = service_id, cmd_args = ["echo", "hello"])
exec(  
# The service to execute the command on. Mandatory
    service_id = service_id,
# The actual command to execute, the array will be concatenated with " " between the entries. Mandatory
    cmd_args = ["echo", "hello"], 
# The expected exit code of the command. Optional. Default: 0
    expected_exit_code = 0
)
```

The `service_id` and `cmd_args` are required arguments. The `expected_exit_code` is an optional argument that defaults to 0. If the 
`exec` leads to any thing other than the `expected_exit_code` you'll get
 an execution error in Starlark.

### read_file

The `read_file` built in allows you to read a file into a variable. This executes during interpretation time and you won't see it in the dry run.

The syntax looks like

 ```py
contents = read_file(
    # The path to the file to read. Mandatory
    src_path = "github.com/kurtosis-tech/datastore-army-module/README.md"
)
 print(contents)
 ```

Like the other methods above, you don't have to name the parameter. The paths within Starlark are similar to Golang paths. See the [paths in Starlark](#paths-in-starlark) section for more.

### define_fact

Facts are primitive to Starlark. Facts allow you to create a `curl` request
or an `exec` that runs on your container every few seconds. You can extract
output from a `fact` to use elsewhere in your code.

Here are a few sample facts

```py
define_fact(
    # The service id to which this fact is applicable. Mandatory
    service_id = "example-service-id", 
    # The name of the fact
    fact_name = "example-fact-name",
    # The curl request to run to populate the facts
    fact_recipe = struct(
        # The http method can be GET or POST. Mandatory
        method= "GET", 
        # The endpoint to talk to on the service. Mandatory
        endpoint = "/eth/v1/node/health", 
        # The content-type header to set while talking to the service. Mandatory
        content_type = "application/json",
        # The port id to connect to, this should be a valid id on the service. Mandatory
        port_id = HTTP_PORT_ID,
        # A `jq` query to fetch output out of the JSON. Optional
        field_extractor = ".data.enr"
    )
)
```

If you are using a `POST` request, you'll have to supply the `body` parameter as well, so your recipe would look like

```py
fact_recipe = struct(
    # The http method can be GET or POST. Mandatory
    method= "GET", 
    # The endpoint to talk to on the service. Mandatory
    endpoint = "/eth/v1/node/health", 
    # The content-type header to set while talking to the service. Mandatory
    content_type = "application/json",
    # The port id to connect to, this should be a valid id on the service. Mandatory
    port_id = HTTP_PORT_ID,
    # The body of the post request. Mandatory
    body = '{"data": "data to post"}'
    # A `jq` query to fetch output out of the JSON. Optional
    field_extractor = ".data.enr"
)
```

Learn more about the [jq](https://stedolan.github.io/jq/manual/) syntax here. Any valid `jq` syntax should be valid for the `field_extractor`.

### wait

The `wait` method allows you to wait for the `fact` to have a valid value. The `wait` syntax looks like

```py
enr = wait(service_id = "service_id", fact_name = "example-fact-name")
print(enr)
```

The `enr` above would contain a reference to the value extracted in the fact. If you use this reference in `cmd_args`, `env_vars` or `entry_point_args` it
would get replaced with the actual value during execution time.

## More About Starlark

### Modules in Starlark

Modules in Starlark, are a package of Starlark scripts, meta data files, static files & type definitions. The most basic module would look like below,

```
/kurtosis.mod
/main.star
```

The paths here are relative to the root of the folder.

Where the `kurtosis.mod` is a YAML that would look like

```yaml
module:
  name: github.com/<your-github-org-or-user-name>/<repo-name>
```

To execute locally, the module name doesn't have to exist on Github, you can plugin whatever you want for the `<your-github-org-or-user-name>` & `<repo-name>`.

Inside the module while referring to other files, make sure that you use the same `module.name` in the `Kurtosis.mod` followed by the path of the file from the root of the module.

```
/kurtosis.mod
/main.star
/static/example.txt
```

For `main.star` to read contents of `example.txt` the code would look like.

```py
# main.star

# The main method is mandatory and can optionally contain arguments
def main():
    contents = read_file("github.com/foo/bar/static/example.txt)
    print(contents)
```

```yaml
# kurtosis.mod
module:
  name: github.com/foo/bar
```

To execute the above module, you could run from the root of the module

```bash
kurtosis exec ${PWD}
```

### Paths in Starlark

Paths in Starlark are Golang like paths. At the time of writing Starlark 
 at Kurtosis supports only GitHub paths, the paths can be used for reading files, importing other modules or importing types.

The structure of a valid path looks like

 ```
 github.com/moduleAuthor/moduleName/path/on/repo/file.star
 ```

If this file is on GitHub, Starlark will clone the repo `github.com/moduleAuthor/moduleName/` to the enclave and then it will read the file at
 `/path/on/repo/file.star` relative to the root of the cloned repository.

If you are executing a module make sure that all referred paths, are referred
by the `module id` where the `module id` looks like `github.com/moduleAuthor/moduleName`. See the [starlark module](#modules-in-starlark) section for more.