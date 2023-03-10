---
title: Starlark Instructions
sidebar_label: Starlark Instructions
sidebar_position: 3
---

This page lists out the Kurtosis instructions that are available in Starlark.

**GENERAL NOTE:** In Python, it is very common to name function parameters that are optional. E.g.:

```python
def do_something(required_arg, optional_arg="default_value")
```

In Kurtosis Starlark, all parameters can be referenced by name regardless of whether they are required or not. We do this to allow for ease-of-reading clarity. Mandatory and optional parameters will be indicated in the comment above the field.

Similarly, all function arguments can be provided either positionally or by name. E.g. a function signature of:

```python
def make_pizza(size, topping = "pepperoni")
```

Can be called in any of the following ways:

```python
# 1. Only the required argument filled, positionally
make_pizza("16cm")

# 2. Only the required argument filled, by name 
make_pizza(size = "16cm")

# 3. Both arguments filled, positionally
make_pizza("16cm", "mushroom")

# 4. Both arguments filled, mixing position and name
make_pizza("16cm", topping = "mushroom")

# 5. Both arguments filled, by name
make_pizza(size = "16cm", topping = "mushroom")
```

We recommend the last style (naming both positional and optional args), for reading clarity.

### add_service

The `add_service` instruction adds a service to the Kurtosis enclave within which the script executes.

```python
service = add_service(
    # The service ID of the service being created.
    # The service ID is a reference to the service, which can be used in the future to refer to the service.
    # Service IDs are unique per enclave.
    # MANDATORY
    service_id = "example-datastore-server-1",

    config = struct(
        # The name of the container image that Kurtosis should use when creating the service’s container.
        # MANDATORY
        image = "kurtosistech/example-datastore-server",

        # The ports that the container should listen on, identified by a user-friendly ID that can be used to select the port again in the future.
        # If no ports are provided, no ports will be exposed on the host machine, unless there is an EXPOSE in the Dockerfile
        # OPTIONAL (Default: {})
        ports = {
            "grpc": PortSpec(
                # The port number.
                # MANDATORY
                number = 1234,

                # The port transport protocol (can be "TCP" or "UDP")
                # OPTIONAL (Default: "TCP")
                protocol = "TCP",
            )
        },

        # A mapping of path_on_container_where_contents_will_be_mounted -> files_artifact_id_to_mount
        # For more info on what a files artifact is, see below
        # OPTIONAL (Default: {})
        files = {
            "path/to/file/1": "files_artifact_1",
            "path/to/file/2": "files_artifact_2"
        },

        # The ENTRYPOINT statement hardcoded in a container image's Dockerfile might not be suitable for your needs.
        # This field allows you to override the ENTRYPOINT when the container starts.
        # OPTIONAL (Default: [])
        entrypoint = [
            "bash"
        ],

        # The CMD statement hardcoded in a container image's Dockerfile might not be suitable for your needs.
        # This field allows you to override the CMD when the container starts.
        # OPTIONAL (Default: [])
        cmd = [
            "-c",
            "sleep 99",
        ],

        # Defines environment variables that should be set inside the Docker container running the service. 
        # This can be necessary for starting containers from Docker images you don’t control, as they’ll often be parameterized with environment variables.
        # OPTIONAL (Default: {})
        env_vars = {
            "VAR_1": "VALUE_1",
            "VAR_2": "VALUE_2",
        },

        # ENTRYPOINT, CMD, and ENV variables sometimes need to refer to the container's own IP address. 
        # If this placeholder string is referenced inside the 'entrypoint', 'cmd', or 'env_vars' properties, the Kurtosis engine will replace it at launch time
        # with the container's actual IP address.
        # OPTIONAL (Default: "KURTOSIS_IP_ADDR_PLACEHOLDER")
        private_ip_address_placeholder = "KURTOSIS_IP_ADDRESS_PLACEHOLDER"
)
```
The `ports` dictionary argument accepts a key value pair, where `key` is a user defined unique port identifier and `value` is a [PortSpec][starlark-types-port-spec] object.

:::info
See [here][files-artifacts] for more details on files artifacts.
:::

The `add_service` function returns a `service` object that contains service information in the form of [future references][future-references-reference] that can be used later in the script. The `service` struct has:
- An `ip_address` property representing [a future reference][future-references-reference] to the service's IP address.
- A `ports` dictionary containing [future reference][future-references-reference] information about each port that the service is listening on.

The value of the `ports` dictionary is an object with three properties, `number`, `transport_protocol` and `application_protocol` (optional), which themselves are [future references][future-references-reference].

Example:
```python
dependency = add_service(
    service_id = "dependency",
    config = struct(
        image = "dependency",
        ports = {
            "http": PortSpec(number = 80),
        },
    ),
)

dependency_http_port = dependency.ports["http"]

add_service(
    service_id = "dependant",
    config = struct(
        env_vars = {
            "DEPENDENCY_URL": "http://{}:{}".format(dependency.ip_address, dependency_http_port.number),
        },
    )
)
```

### remove_service

The `remove_service` instruction removes a service from the enclave in which the instruction executes in.

```python
remove_service(
    # The service ID of the service to be removed.
    # MANDATORY
    service_id = "my_service"
)
```

### exec

The `exec` instruction executes commands on a given service as if they were running in a shell on the container.

```python
exec_recipe = struct(
    # The service ID to execute the command on.
    # MANDATORY
    service_id = "my_service",

    # The actual command to execute. 
    # Each item corresponds to one shell argument, so ["echo", "Hello world"] behaves as if you ran "echo" "Hello world" in the shell.
    # MANDATORY
    command = ["echo", "Hello, world"],
)
response = exec(exec_recipe)

print(response["output"])
print(response["code"])
```

The instruction returns a `dict` which is a [future reference][future-references-reference]
that contains the keys `output` which contains the output of the execution of the command and `code` which contains the exit code.

They can be chained to `assert` and `wait`:

```python
exec_recipe = struct(
    service_id = "my_service",
    command = ["echo", "Hello, world"],
)

response = exec(exec_recipe)
assert(response["output"], "==", 0)

wait(exec_recipe, "output", "!=", "Greetings, world")
```

### render_templates

`render_templates` combines a template and data to produce a [files artifact][files-artifacts]. Files artifacts can be used with the `files` property in the service config of `add_service`, allowing for reuse of config files across services.

```python
# Example data to slot into the template
template_data = {
    "Name" : "Stranger",
    "Answer": 6,
    "Numbers": [1, 2, 3],
    "UnixTimeStamp": 1257894000,
    "LargeFloat": 1231231243.43,
    "Alive": True
}

artifact_id = render_templates(
    # A dictionary where:
    #  - Each key is a filepath that will be produced inside the output files artifact
    #  - Each value is the template + data required to produce the filepath
    # Multiple filepaths can be specified to produce a files artifact with multiple files inside.
    # MANDATORY
    config = {
        "/foo/bar/output.txt": struct(
            # The template to render, which should be formatted in Go template format:
            #   https://pkg.go.dev/text/template#pkg-overview
            # MANDATORY
            template="Hello {{.Name}}. The sum of {{.Numbers}} is {{.Answer}}. My favorite moment in history {{.UnixTimeStamp}}. My favorite number {{.LargeFloat}}. Am I Alive? {{.Alive}}",

            # The data to slot into the template, can be a struct or a dict
            # The keys should exactly match the keys in the template.
            # MANDATORY
            data=template_data,
        )
    }

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit ID.
    # OPTIONAL (Default: "")
    artifact_id = "my-artifact"
)
```

The return value is a [future reference][future-references-reference] to the ID of the [files artifact][files-artifacts] that was generated, which can be used with the `files` property of the service config of the `add_service` command.

### upload_files

`upload_files` packages the files specified by the [locator][locators] into a [files artifact][files-artifacts] that gets stored inside the enclave. This is particularly useful when a static file needs to be loaded to a service container.

```python
artifact_id = upload_files(
    # The file to upload into a files a files artifact
    # Must be a Kurtosis locator.
    # MANDATORY
    src = "github.com/foo/bar/static/example.txt",

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit ID.
    # OPTIONAL (Default: "")
    artifact_id = "my-artifact",
)
```

The return value is a [future reference][future-references-reference] to the ID of the [files artifact][files-artifacts] that was generated, which can be used with the `files` property of the service config of the `add_service` command.

### store_service_files

Copies files or directories from an existing service in the enclave into a [files artifact][files-artifacts]. This is useful when work produced on one container is needed elsewhere.

```python
artifact_id = store_service_files(
    # The service ID of a preexisting service from which the file will be copied.
    # MANDATORY
    service_id = "example-service-id",

    # The path on the service's container that will be copied into a files artifact.
    # MANDATORY
    src = "/tmp/foo"

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit ID.
    # OPTIONAL (Default: "")
    artifact_id = "my-favorite-artifact-id",
)
```

The return value is a [future reference][future-references-reference] to the ID of the [files artifact][files-artifacts] that was generated, which can be used with the `files` property of the service config of the `add_service` command.

### read_file

The `read_file` function reads the contents of a file specified by the given [locator][locators]. `read_file` executes [at interpretation time][multi-phase-runs-reference] and the file contents won't be displayed in the preview.

 ```python
contents = read_file(
    # The Kurtosis locator of the file to read.
    # MANDATORY
    src = "github.com/kurtosis-tech/datastore-army-package/README.md"
)
 ```
### request

The `request` instruction executes either a POST or GET HTTP request, saving its result in a [future references][future-references-reference].

For GET requests:

```python
get_request_recipe = struct(
    # The service ID that is the server for the request
    # MANDATORY
    service_id = "my_service",

    # The port ID that is the server port for the request
    # MANDATORY
    port_id = "my_port",

    # The endpoint for the request
    # MANDATORY
    endpoint = "/endpoint?input=data",

    # The method is GET for this example
    # MANDATORY
    method = "GET",

    # The extract dictionary takes in key-value pairs where:
    # Key is a way you refer to the extraction later on
    # Value is a 'jq' string that contains logic to extract from response body
    # OPTIONAL
    extract = {
        "extracted-field": ".name.id"
    }
)
get_response = request(
    recipe = get_request_recipe
)
print(get_response["body"]) # Prints the body of the request
print(get_response["code"]) # Prints the result code of the request (e.g. 200, 500)
print(get_response["extract.extracted-field"]) # Prints the result of running ".name.id" query, that is saved with key "extracted-field"
```

For POST requests:
```python
post_request_recipe = struct(
    # The service ID that is the server for the request
    # MANDATORY
    service_id = "my_service",

    # The port ID that is the server port for the request
    # MANDATORY
    port_id = "my_port",

    # The endpoint for the request
    # MANDATORY
    endpoint = "/endpoint",

    # The method is POST for this example
    # MANDATORY
    method = "POST",

    # The content type header of the request (e.g. application/json, text/plain, etc)
    # MANDATORY
    content_type = "text/plain",

    # The body of the request
    # MANDATORY
    body = "text body",

    # The method is GET for this example
    # OPTIONAL (Default: {})
    extract = {}
)
post_response = request(
    recipe = post_request_recipe
)
```

NOTE: You can use the power of `jq` during your extractions. For example, `jq`'s [regular expressions](https://devdocs.io/jq-regular-expressions-pcre/) can be used to manipulate the extracted strings like so:
 
 ```python
 # Assuming response["body"] looks like {"result": {"foo": ["hello/world/welcome"]}}
post_request_recipe = struct(
    ...
    extract = {
        "second-element-from-list-head": '.result.foo | .[0] | split ("/") | .[1]' # 
    }
)
response = request(
    recipe = post_request_recipe
)
# response["extract.second-element-from-list-head"] is "world"
```

### assert

The `assert` instruction fails the Starlark script or package with an execution error if the assertion defined fails.

```python
assert(
    # The value currently being asserted.
    # MANDATORY
    value = "test1"

    # The assertion is the comparison operation between value and target_value.
    # Valid values are "==", "!=", ">=", "<=", ">", "<" or "IN" and "NOT_IN" (if target_value is list).
    # MANDATORY
    assertion = "=="

    # The target value that value will be compared against.
    # MANDATORY
    target_value = "test2"
) # This fails in runtime given that "test1" == "test2" is false

assert(
    # Value can also be a runtime value derived from a `get_value` call
    value = response["body"]
    assertion = "=="
    target_value = 200
)
```

### wait

The `wait` instruction fails the Starlark script or package with an execution error if the assertion does not succeed in a given period of time.
If it succedes, it returns a [future references][future-references-reference] with the last recipe run.

```python
# This fails in runtime if response["code"] != 200 for each request in a 5 minute time span
response = wait(
    # The recipe that will be run until assert passes.
    # MANDATORY
    recipe = get_request_recipe

    # The field of the recipe's result that will be asserted
    # MANDATORY
    field = "code"

    # The assertion is the comparison operation between value and target_value.
    # Valid values are "==", "!=", ">=", "<=", ">", "<" or "IN" and "NOT_IN" (if target_value is list).
    # MANDATORY
    assertion = "=="

    # The target value that value will be compared against.
    # MANDATORY
    target_value = 200

    # The interval value is the initial interval suggestion for the command to wait between calls
    # It follows a exponential backoff process, where the i-th backoff interval is rand(0.5, 1.5)*interval*2^i
    # Follows Go "time.Duration" format https://pkg.go.dev/time#ParseDuration
    # OPTIONAL (Default: "500ms")
    interval = "1s"

    # The timeout value is the maximum time that the command waits for the assertion to be true
    # Follows Go "time.Duration" format https://pkg.go.dev/time#ParseDuration
    # OPTIONAL (Default: "15m")
    timeout = "5m"
)
# If this point of the code is reached, the assertion has passed therefore the print statement will print "200"
print(response["code"])
```

### import_module

The `import_module` function imports the symbols from a Starlark script specified by the given [locator][locators].

```python
# Import the code to namespaced object
lib = import_module("github.com/foo/bar/src/lib.star")

# Use code from the imported module
lib.some_function()
```

NOTE: We chose not to use the normal Starlark `load` primitive due to its lack of namespacing. By default, the symbols imported by `load` are imported to the global namespace of the script that's importing them. We preferred module imports to be namespaced, in the same way that Python does by default.

### print

`print` will add an instruction to the plan to print the string. When the `print` instruction is executed during the Execution Phase, [future references][future-references-reference] will be replaced with their execution-time values.

```
print("Any string here")
```

Starlark Standard Libraries
---------------------------

The following Starlark libraries that ship with the `starlark-go` are included 
in Kurtosis Starlark by default

1. The Starlark [time](https://github.com/google/starlark-go/blob/master/lib/time/time.go#L18-L52) is a collection of time-related functions
2. The Starlark [json](https://github.com/google/starlark-go/blob/master/lib/json/json.go#L28-L74) module allows you `encode`, `decode` and `indent` JSON
4. The Starlark [struct](https://github.com/google/starlark-go/blob/master/starlarkstruct/struct.go) builtin allows you to create `structs` like the one used in [`add_service`](#addservice)


<!--------------- ONLY LINKS BELOW THIS POINT ---------------------->
[locators]: ./locators.md
[files-artifacts]: ./files-artifacts.md
[multi-phase-runs-reference]: ./multi-phase-runs.md
[future-references-reference]: ./future-references.md
[starlark-types-port-spec]: ./starlark-types.md#PortSpec
