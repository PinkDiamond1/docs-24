---
title: Starlark Reference Guide
sidebar_label: Starlark Reference
---
:warning: **Starlark at Kurtosis is in an alpha state. Message us on discord [here](https://discord.com/channels/783719264308953108/783719264308953111) in case you run into problems.**

Instructions
------------

**GENERAL NOTE:** In Python, it is very common to name function parameters that are optional. E.g.:

```py
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
make_pizza("16cm", topping = "mushrom")

# 5. Both arguments filled, by name
make_pizza(size = "16cm", topping = "mushroom")
```

We recommend the last style, for its reading clarity.

### add_service

The `add_service` instruction adds a service to the Kurtosis enclave within which the script executes. The instruction
looks like:

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
            "grpc": struct(
                # The port number.
                # MANDATORY
                number = 1234,

                # The port transport protocol (can be "TCP" or "UDP")
                # OPTIONAL (Default: "TCP")
                protocol = "TCP",
            )
        },

        # Kurtosis enclaves can store gzipped TAR files, called "files artifacts", via functions like upload_files, render_templates, and store_files_from_service.
        # Each files artifact is identified by an ID which is returned when the files artifact is created.
        # This map specifies files artifacts that should be mounted on the service container when it starts.
        # OPTIONAL (Default: {})
        files = {
            "files_artifact_1": "path/to/file/1",
            "files_artifact_2": "path/to/file/2"
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

The `add_service` function returns a `service` object that contains information about the service that can be used later in the script. The `service` struct has:

- An `ip_address` property representing the service's IP address
- A `ports` dictionary containing information about each port that the service is listening on

The value of the `ports` dictionary is an object with two fields, `number` and `protocol`. 

E.g.:

```python
dependency = add_service(
    service_id = "dependency",
    config = struct(
        image = "dependency",
        ports = {
            "http": struct(number = 80),
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

The `exec` instruction executes commands on a given service as if they were running in a shell on the container. Its syntax is:

```python
exec(
    # The service ID to execute the command on.
    # MANDATORY
    service_id = "my_service",

    # The actual command to execute. 
    # Each item corresponds to one shell argument, so ["echo", "Hello world"] behaves as if you ran "echo" "Hello world" in the shell.
    # MANDATORY
    command = ["echo", "Hello, world"],

    # The expected exit code of the command.
    # OPTIONAL (Default: 0)
    expected_exit_code = 0
)
```

If the `exec` results in an exit code other than `expected_exit_code`, the command will return an error at execution time.

### render_templates

`render_templates` combines a template and data to produce a files artifact stored in the Kurtosis enclave. Files artifacts can be used with the `files` property in the service config of `add_service`, allowing for reuse of config files across services.

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

The result of `render_templates` is the ID of the files artifact that was generated, which can be used with the `files` property of service config in the `add_service` command.

### upload_files

`upload_files` packages the requested files as a files artifact that gets stored inside the enclave. This is particularly useful when you have a static file that you'd like to push to a service you're starting. The syntax looks like:

```python
artifact_id = upload_files(
    # The file to upload into a files a files artifact
    # Must be a Kurtosis resource specification.
    # MANDATORY
    src = "github.com/foo/bar/static/example.txt",

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit ID.
    # OPTIONAL (Default: "")
    artifact_id = "my-artifact",
)
```

Note that the `src_path` needs to be a resource identifier as defined in [the "Dependencies" section][dependencies].

### store_service_files

Produces a files artifact by copying files or directories from an existing service in the enclave. The syntax looks like:

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

### read_file

The `read_file` function reads the contents of a file into a variable. This executes at interpretation time and the file contents won't be displayed in the list of flattened commands to run.

The syntax looks like:

 ```python
contents = read_file(
    # The path to the file to read, which must obey Kurtosis package syntax. 
    # MANDATORY
    src_path = "github.com/kurtosis-tech/datastore-army-module/README.md"
)
 ```

To understand the syntax of the source path, see [the "Dependencies" section][dependencies].

### get_value

The `get_value` instruction executes either a POST or GET HTTP request, saving its result in a runtime variable.

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
)
get_response = get_value(
    recipe = get_request_recipe
)
print(get_response.body) # Prints the body of the request
print(get_response.code) # Prints the result code of the request (e.g. 200, 500)
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
    content_type="text/plain",

    # The body of the request
    # MANDATORY
    body="text body"
)
post_response = get_value(
    recipe = post_request_recipe
)
```

### assert

The `assert` instruction fails the Starlark script with an execution error if the assertion defined fails.

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
    value = response.body
    assertion = "=="
    target_value = 200
)
```


### extract

The `extract` instruction evaluates a JQ-like string against a JSON string value, extracting its field.

```python
value = extract(
    # The input is a JSON string.
    # MANDATORY
    input = "{'key': 'my_value'}",

    # The extractor is a JQ-like string.
    # MANDATORY
    extractor = ".key"
)
print(value) # Prints 'my_value'
```

Extracts can also be chained after a `get_value` call:

```python
get_response = get_value(
    recipe = get_request_recipe
)
value = extract(
    input = get_response.body,
    extractor = ".id"
)
```

### import_module

Kurtosis Starlark scripts can depend on other scripts. To import another script, use the `import_module` function. The result object will contain all the symbols of the imported script.

```python
# Import the code to namespaced object
lib = import_module("github.com/foo/bar/src/lib.star")

# Use code from the imported module
lib.some_function()
```

NOTE: We chose not to use the normal Starlark `load` primitive because it doesn't do namespacing. By default, the symbols imported by `load` are imported to the global namespace of the script that's importing them. We preferred module imports to be namespaced, in the same way that Python does by default.

Dependencies
------------
A Starlark script can depend on and use other resources, including static files and other Starlark scripts. Static file contents are imported using the `read_file` command, while other Starlark scripts are imported using the `import_module` command.

In both cases, the external file is referenced using a fully-qualified URL like so:

```
github.com/moduleAuthor/moduleName/path/in/repo/some-file.star
```

(Go developers will recognize this syntax as similar to Go's import syntax; the Kurtosis dependency system takes inspiration from Go's module system. Also note that the url doesn't have things like "blob", "tree" etc that GitHub urls do have)

Note: At the moment Starlark only supports public repositories hosted on GitHub.

All import paths are URLs; there is no notion of relative imports in Kurtosis even for local paths. We made this choice to allow for performance optimizations: the result of loading any given resource can be cached based on the resource URL.

However, a `read_file` or `import_module` command alone is not enough information for Kurtosis to understand your script's dependencies because there are no relative imports. Next to your `main.star` file, you will need a `kurtosis.yml` file like so:

```yaml
# Should correspond to URL to locate this kurtosis.yml file on Github.
# This has to live in the root of the repository next to the main.star
# all other files can be in any nested directory or at root.
name: "github.com/<your-github-org-or-user-name>/<repo-name>"
```

The module name will tell Kurtosis that any imports using that name should be resolved locally, rather than by cloning a remote Github URL.

For example, if we have a repo with these contents:

```
/
    kurtosis.yml
    main.star
    public-key.json
```


with a `kurtosis.yml` file like so:

```yaml
name: "github.com/kurtosis/example"
```

and a `main.star` like so:

```python
public_key = read_file(src_path = "github.com/kurtosis/example/public-key.json")

def main():

    print(public_key)
```

then Kurtosis will know that the contents of `public-key.json` should be retrieved from the file living right next to the `kurtosis.yml` file (due to the shared module name).

To run the module, it's enough to run the following in the directory with the `kurtosis.yml` file:

```
kurtosis run .
```


Starlark Standard Libraries
---------------------------

The following Starlark libraries that ship with the `starlark-go` are included 
in Kurtosis Starlark by default

1. The Starlark [time](https://github.com/google/starlark-go/blob/master/lib/time/time.go#L18-L52) is a collection of time-related functions
2. The Starlark [json](https://github.com/google/starlark-go/blob/master/lib/json/json.go#L28-L74) module allows you `encode`, `decode` and `indent` JSON
3. The Starlark [proto](https://github.com/google/starlark-go/blob/master/lib/proto/proto.go) module allows you to define and interact with `proto` objects
4. The Starlark [struct](https://github.com/google/starlark-go/blob/master/starlarkstruct/struct.go) builtin allows you to create `structs` like the one used in [`add_service`](#addservice)


<!--------------- ONLY LINKS BELOW THIS POINT ---------------------->
[dependencies]: #dependencies
