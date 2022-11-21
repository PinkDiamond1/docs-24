---
title: Starlark Reference Guide
sidebar_label: Reference
---
:warning: **Starlark at Kurotsis is in an alpha state. Message us on discord [here](https://discord.com/channels/783719264308953108/783719264308953111) in case you run into problems.**

Instructions
------------

**GENERAL NOTE:** In Python, it is very common to name function parameters that are optional. E.g.:

```py
def do_something(required_arg, optional_arg="default_value")
```

In Kurtosis Starlark, all parameters can be referenced by name regardless of whether they are required are not. We do this to allow for ease-of-reading clarity. Mandatory and optional parameters will be indicated in the comment above the field.

Similarly, all function arguments can be provided either positionally or by name. E.g. a function signature of:

```
def make_pizza(size, topping = "pepperoni")
```

Can be called in any of the following ways:

```
# 1. Only the required argument filled, positionally
make_pizza("16cm")

# 2. Only the required argument filled, by name 
make_pizza(size = "16cm)

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

The `exec` instruction executes commands on a given service as if they were running in a shell on the container. It looks like

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

To understand the syntax of the source path, see [the "Dependencies in Starlark" section][dependencies-in-starlark].

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

# Template data must be JSON-encoded
# json.encode & json.decode can be used within Starlark
json_encoded_template_data = json.encode(template_data)

artifact_id = render_templates(
    # A dictionary where:
    #  - Each key is a filepath that will be produced inside the output files artifact
    #  - Each value is the template + data required to produce the filepath
    # Multiple filepaths can be specified to produce a files artifact with multiple files inside.
    # MANDATORY
    template_and_data_by_dest_rel_filepath = {
        "/foo/bar/output.txt": {
            # The template to render, which should be formatted in Go template format:
            #   https://pkg.go.dev/text/template#pkg-overview
            # MANDATORY
            "template": "Hello {{.Name}}. The sum of {{.Numbers}} is {{.Answer}}. My favorite moment in history {{.UnixTimeStamp}}. My favorite number {{.LargeFloat}}. Am I Alive? {{.Alive}}",

            # The data to slot into the template, serialized into JSON. 
            # The JSON object properties should exactly match the keys in the template.
            # MANDATORY
            "template_data_json": json_encoded_template_data,
        }
    }

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit UUID.
    # OPTIONAL (Default: "")
    artifact_uuid = "my-artifact"
)
```

The result of `render_templates` is the ID of the files artifact that was generated, which can be used with the `files` property of service config in the `add_service` command.

### upload_files

`upload_files` uploads stores files as a files artifact inside the enclave. This is particularly useful when you have a static file in your [module](#modules-in-starlark) that you'd like to push to a service you're starting. The syntax looks like:

```python
artifact_id = upload_files(
    # The file to upload into a files a files artifact
    # Must be a Kurtosis resource specification.
    # MANDATORY
    src_path = "github.com/foo/bar/static/example.txt",

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit UUID.
    # OPTIONAL (Default: "")
    artifact_uuid = "my-artifact",
)
```

Note that the `src_path` needs to follow our [paths](#paths-in-starlark) specification.

### store_file_from_service

Produces a files artifact by copying files or directories from an existing service in the enclave. The syntax looks like:

```python
artifact_id = store_file_from_service(
    # The service ID of a preexisting service from which the file will be copied.
    # MANDATORY
    service_id = "example-service-id",

    # The path on the service's container that will be copied into a files artifact.
    # MANDATORY
    src_path = "/tmp/foo"

    # The ID to give the files artifact that will be produced.
    # If none is specified, Kurtosis will generate a random hex-encoded 36-bit UUID.
    # OPTIONAL (Default: "")
    artifact_uuid = "my-favorite-artifact-id",
)
```


### define_fact

A "fact" is a piece of data about the enclave that, once created, is constantly being updated. Facts have recipes, which define how 
their data will be produced. Fact recipes come in two flavors - `curl` and `exec`. `curl` facts are populated by making an HTTP request
against a service endpoint, while `exec` facts are populated by running a shell command on a service container. 

The output of a fact can be used later in Starlark, and facts are the way to retrieve and use runtime information about the system.

For example:

```python
define_fact(
    # The service ID of the service from which data will be extracted.
    # MANDATORY
    service_id = "example-service-id",

    # The name of the fact, which can be used to reference it later.
    # MANDATORY
    fact_name = "example-fact-name",

    # The curl request to run to populate the fact.
    # MANDATORY
    fact_recipe = struct(
        # The HTTP method to use when making the request (can be "GET" or "POST").
        # MANDATORY
        method= "POST",

        # The ID of the port on the service to retrieve data from. 
        # This should correspond to the port ID defined in `add_service`
        # MANDATORY
        port_id = "http",

        # The URL endpoint to talk to on the service.
        # MANDATORY
        endpoint = "/eth/v1/node/health",

        # The content-type header to set while talking to the service.
        # MANDATORY
        content_type = "application/json",

        # The body to send with the request. 
        # Mostly used for POST requests, as many servers don't support GET request bodies.
        # OPTIONAL (Default: "")
        body = '{"data": "data to post"}'

        # The HTTP response body can optionally be passed through a JSON-parsing and field extraction step using the 'jq' tool.
        # When provided, this field's path will be treated as a 'jq' path and applied to the response body.
        # For the full JQ syntax, see the jq docs:
        #   https://stedolan.github.io/jq/manual/
        # OPTIONAL (Default: '.')
        field_extractor = ".data.enr"
    )
)
```

The return value of `define_fact` is a reference which can be included in the `cmd`, `entrypoint`, or `env_vars` sections of `add_service`. The Kurtosis engine will insert the correct value when the service container is launched.

### wait

The `wait` method pauses execution until the specified fact has the desired value, or a timeout occurs. The `wait` syntax looks like:

```python
wait(
    # The service ID of the service whose fact will be waited upon.
    # MANDATORY
    service_id = "service_id",

    # The name of the fact on the service whose value will be waited upon.
    # MANDATORY
    fact_name = "example-fact-name",
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

In both cases, the external file is referenced using a fully-qualified URL-like path like so:

```
github.com/moduleAuthor/moduleName/path/in/repo/file.star
```

(Go developers will recognize this syntax as similar to Go's import syntax; the Kurtosis dependency system takes inspiration from Go's module system)

This path will give the Kurtosis engine all the information it needs to e 

Starlark Standard Libraries
---------------------------

The following Starlark libraries that ship with the `starlark-go` are included 
in Kurtosis Starlark by default

1. The Starlark [time](https://github.com/google/starlark-go/blob/master/lib/time/time.go#L18-L52) is a collection of time-related functions
2. The Starlark [json](https://github.com/google/starlark-go/blob/master/lib/json/json.go#L28-L74) module allows you `encode`, `decode` and `indent` JSON
3. The Starlark [proto](https://github.com/google/starlark-go/blob/master/lib/proto/proto.go) module allows you to define and interact with `proto` objects
4. The Starlark [struct](https://github.com/google/starlark-go/blob/master/starlarkstruct/struct.go) builtin allows you to create `structs` like the one used in [`add_service`](#addservice)










More About Starlark
-------------------

### Dependencies in Starlark

A Starlark script can depend on and use other resources, including static files and other Starlark scripts. Static file contents are imported using the `read_file` command, while other Starlark scripts are imported using the `import_module` command.

In both cases, the external file is referenced using a fully-qualified URL-like path like so:

```
github.com/moduleAuthor/moduleName/path/in/repo/file.star
```

This system was inspired by Go's module system, and behaves similarly: 

. At the time of writing Starlark 
 at Kurtosis supports only GitHub paths, the paths can be used for reading files, importing other modules or importing types.

The structure of a valid path looks like


If this file is on GitHub, Starlark will clone the repo `github.com/moduleAuthor/moduleName/` to the enclave and then it will read the file at
 `/path/on/repo/file.star` relative to the root of the cloned repository.

If you are executing a module make sure that all referred paths, are referred
by the `module ID` where the `module ID` looks like `github.com/moduleAuthor/moduleName`. See the [starlark module](#modules-in-starlark) section for more.

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


<!--------------- ONLY LINKS BELOW THIS POINT ---------------------->
[modules-in-starlark]: #modules-in-starlark
[dependencies-in-starlark]: #dependencies-in-starlark
