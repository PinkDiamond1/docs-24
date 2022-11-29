---
title: Kurtosis CLI
sidebar_label: Using the CLI
slug: /cli
sidebar_position: 3
---


The [Kurtosis CLI](/install) is the main way to interact with Kurtosis. This document will present some common CLI workflows.

:::tip
The `kurtosis` command, and all of its subcommands, will print helptext when passed the `-h` flag. You can use this at any time to see information on the command you're trying to run. For example:
```
kurtosis service -h
```
:::

:::tip
 Kurtosis supports tab-completion. To add it, [follow these instructions](/cli#adding-tab-completion).
:::

### Initialize configuration
When the Kurtosis CLI is executed for the first time on a machine, we ask you to make a choice about whether [you'd like to send anonymized usage metrics to help us make the product better](/reference/metrics-philosophy). To make this election non-interactively, you can run either:

```bash
kurtosis config init send-metrics
```

to send anonymized metrics to improve the product or

```bash
kurtosis config init dont-send-metrics
```

if you'd prefer not to.

### Start the engine
The CLI functions through calls to the Kurtosis engine, which is a very lightweight container. The CLI will start the engine container automatically for you so you should never need to start it manually, but you can do so if you please:

```bash
kurtosis engine start
```

### Check engine status
The engine's version and status can be printed with:

```bash
kurtosis engine status
```

### Stop the engine
To stop the engine, run:

```bash
kurtosis engine stop
```

### Run Starlark
A single Starlark script can be ran with:

```bash
kurtosis run script.star
```

Adding the `--dry-run` flag will print the changes without executing them.

A [Kurtosis package][packages-reference] on your local machine can be run with:

```bash
kurtosis run /path/to/package/on/your/machine
```

A [runnable Kurtosis package][packages-reference] published to GitHub can be run like so:

```bash
kurtosis run github.com/package-author/package-repo
```

Arguments can be provided to a Kurtosis package (either local or from GitHub) by passing a JSON-serialized object with the `--args` flag:

```bash
# Local package
kurtosis run /path/to/package/on/your/machine --args '{"company":"Kurtosis"}'

# GitHub package
kurtosis run github.com/package-author/package-repo --args '{"company":"Kurtosis"}'
```

### Create an enclave
The environments in Kurtosis that house your containers are called "enclaves". They are isolated from each other, to ensure they don't interfere with each other. To create a new, empty enclave, run:

```bash
kurtosis enclave new
```

### List enclaves
To see all the enclaves in Kurtosis, run:

```bash
kurtosis enclave ls
```

The enclave IDs that are printed will be used in enclave manipulation commands.

### View enclave details
To view detailed information about a given enclave, run:

```bash
kurtosis enclave inspect $THE_ENCLAVE_ID
```

This will print detailed information about:

* The enclave's status (running or stopped)
* The services inside the enclave (if any), and the information for accessing those services' ports from your local machine

### Dump enclave information to disk
You'll likely need to store enclave logs to disk at some point - maybe you want to have a log package if your CI fails, or you want to record historical logs as you work on a module, or you want to send debugging information to a module author. Whatever the case may be, you can run:

```bash
kurtosis enclave dump $THE_ENCLAVE_ID $OUTPUT_DIRECTORY
```

You'll get the container logs & configuration in the output directory for further analysis & sharing.

### Delete an enclave
To delete an enclave and everything inside of it, run:

```bash
kurtosis enclave rm $THE_ENCLAVE_ID
```

Note that this will only delete stopped enclaves. To delete a running enclave, pass in the `-f`/`--force` flag.

### Add a service to an enclave
To add a service to an enclave, run:

```bash
kurtosis service add $THE_ENCLAVE_ID $THE_SERVICE_ID $CONTAINER_IMAGE
```

Much like `docker run`, this command has multiple options available to customize the service that's started:

1. The `--entrypoint` flag can be passed in to override the binary the service runs
1. The `--env` flag can be used to specify a set of environment variables that should be set when running the service
1. The `--ports` flag can be used to set the ports that the service will listen on

To override the service's CMD, add a `--` after the image name and then pass in your CMD args like so:

```bash
kurtosis service add --entrypoint sh my-enclave test-service alpine -- -c "echo 'Hello world'"
```

### View a service's logs
To print the logs for a service, run:

```bash
kurtosis service logs $THE_ENCLAVE_ID $THE_SERVICE_ID
```

The service ID is printed upon inspecting an enclave.

The `-f` flag can also be added to continue following the logs, similar to `tail -f`.


### Run commands inside a service container
You might need to get access to a shell on a given service container. To do so, run:

```bash
kurtosis service shell $THE_ENCLAVE_ID $THE_SERVICE_ID
```

### Delete a service from an enclave
Services can be deleted from an enclave like so:

```bash
kurtosis service rm $THE_ENCLAVE_ID $THE_SERVICE_ID
```

**NOTE:** To avoid destroying debugging information, Kurtosis will leave removed services inside the Docker engine. They will be stopped and won't show up in the list of active services in the enclave, but you'll still be able to access them (e.g. using `service logs`) by their service GUID (available via `enclave inspect`).


### Remove old artifacts from Kurtosis
Kurtosis defaults to leaving enclave artifacts (containers, volumes, etc.) around so that you can refer back them for debugging. To clean up artifacts from stopped enclaves, run:

```bash
kurtosis clean
```

To remove artifacts from _all_ enclaves (including running ones), add the `-a`/`--all` flag.

NOTE: This will not stop the Kurtosis engine itself! To do so, see "Stopping the engine" above.


Adding Tab Completion
---------------------
<!-- NOTE TO KURTOSIS DEVS: 

This section was generated by referencing the kubectl docs:
* https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/
* https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-bash-mac/
* https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-zsh/
* https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-fish/

-->

[The Kurtosis CLI](/cli) supports tab completion for `bash`, `zsh`, and `fish` via the `kurtosis completion SHELL` command (e.g. `kurtosis completion bash`). `source`ing the output of the command will enable tab-completion, and adding the `source` command to your shell config file will enable it across shells. The instructions below will get you set up for your shell.

**NOTE:** As of 2022-02-21, tab completion for all commands is available but intelligent tab completion for command parameters (e.g. `kurtosis enclave inspect <TAB>` auto-completing enclave IDs) is still ongoing.


### Bash

1. Ensure you have Bash version >= 4.1
    1. Print your Bash version:
        ```bash
        echo $BASH_VERSION
        ```
    1. If your Bash version is less than 4.1, upgrade it:
        * On Mac, upgrade Mac via Homebrew:
            ```bash
            brew install bash
            ```
        * On Linux, [upgrade it via the package manager for your distro](https://www.configserverfirewall.com/linux-tutorials/update-bash-linux/)
1. Check if you have [bash-completion](https://github.com/scop/bash-completion) installed:
    ```bash
    type _init_completion
    ```
1. If you get an error like `-bash: type: _init_completion: not found`, install Bash completion:
    * On Mac:
        1. Install the completion library:
            ```bash
            brew install bash-completion@2
            ```
        1. Add the following to your `~/.bash_profile`:
            ```bash
            export BASH_COMPLETION_COMPAT_DIR="/usr/local/etc/bash_completion.d"
            [[ -r "/usr/local/etc/profile.d/bash_completion.sh" ]] && . "/usr/local/etc/profile.d/bash_completion.sh"
            ```
        1. Reload your shell
        1. Verify that you now have the completion installed:
            ```bash
            type _init_completion
            ```
    * On Linux, install it using the package manager for your distro using [these installation instructions](https://github.com/scop/bash-completion#installation)
1. Source the output of `kurtosis completion bash` in your Bash config file:
    * On Mac, add the following to your `~/.bash_profile` file:
        ```bash
        # Add Kurtosis tab-completion
        source <(kurtosis completion bash)
        ```
    * On Linux, add the following to your `~/.bashrc` file:
        ```bash
        # Add Kurtosis tab-completion
        source <(kurtosis completion bash)
        ```
1. If you have an alias set up for Kurtosis, add completion for that as well (we'll assume the alias `kt` in the examples below):
    * On Mac, add the following to your `~/.bash_profile` file:
        ```bash
        # Add tab-completion to Kurtosis alias
        complete -F __start_kurtosis kt
        ```
    * On Linux, add the following to your `~/.bashrc` file:
        ```bash
        # Add tab-completion to Kurtosis alias
        complete -F __start_kurtosis kt
        ```
1. Reload your shell

### Zsh

1. Add the following to your `~/.zshrc` file:
    ```zsh
    # Add Kurtosis tab-completion
    source <(kurtosis completion zsh)
    ```
1. If you have an alias set up for Kurtosis, add the following to your `~/.zshrc` file (we'll assume the alias `kt` in this example):
    ```zsh
    # Add tab-completion to Kurtosis alias
    compdef __start_kurtosis kt
    ```
1. Reload your shell
1. If you get an error like `complete:13: command not found: compdef`, add the following to the top of your `~/.zshrc` and reload your shell again:
    ```zsh
    autoload -Uz compinit
    compinit
    ```

### Fish

1. Add the following to your `~/.config/fish/config.fish` file:
    ```fish
    # Add Kurtosis tab-completion
    kurtosis completion fish | source
    ```
1. Reload your shell



<!-------------------- ONLY LINKS BELOW THIS POINT ----------------------->
[packages]: ../reference/packages.md
