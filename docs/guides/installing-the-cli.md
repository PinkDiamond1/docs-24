---
title: Installing The CLI
sidebar_label: Installing The CLI
slug: /install
sidebar_position: 1
---

Interacting with Kurtosis is done via [a CLI](/cli). The instructions below will walk you through installing it.

:::tip
Kurtosis supports tab completion, and we strongly recommend [installing it][installing-tab-completion] after you install the CLI.
:::

<details>
<summary>Homebrew</summary>

```
brew install kurtosis-tech/tap/kurtosis-cli
```

NOTE: Homebrew might warn you that your Xcode is outdated, like so:

```
Error: Your Xcode (11.5) is too outdated.
Please update to Xcode 12.5 (or delete it).
```

[This is a Homebrew requirement](https://docs.brew.sh/Installation), and has nothing to do with Kurtosis (which ships as prebuilt binaries). To update your Xcode, run:

```
xcode-select --install
```
</details>

<details>
<summary>apt</summary>

```
echo "deb [trusted=yes] https://apt.fury.io/kurtosis-tech/ /" | sudo tee /etc/apt/sources.list.d/kurtosis.list
sudo apt update
sudo apt install kurtosis-cli
```
</details>

<details>
<summary>yum</summary>

```
echo '[kurtosis]
name=Kurtosis
baseurl=https://yum.fury.io/kurtosis-tech/
enabled=1
gpgcheck=0' | sudo tee /etc/yum.repos.d/kurtosis.repo
sudo yum install kurtosis-cli
```
</details>

<details>
<summary>deb, rpm, and apk</summary>

Download the appropriate artifact from [the release artifacts page][release-artifacts].
</details>

Once you're done, [the quickstart is a great place to get started](/quickstart).

Metrics Election
----------------
The first time you run the Kurtosis CLI, you'll be asked to make an election about whether you'd like to send anonymized product analytics metrics. Our reasons for doing this, and how we strive to do this ethically, can be found [here](/explanations/metrics-philosophy).

If you're running the CLI in a CI environment, see [these instructions](/ci) to see how to make the metrics election non-interactively.

Upgrading
---------
You can check the version of the CLI you're running with `kurtosis version`. To upgrade to latest, check [the changelog to see if there are any breaking changes][cli-changelog] and follow the steps below. 

NOTE: if you're upgrading the CLI's minor version (the `Y` in a `X.Y.Z` version), you may need to restart your Kurtosis engine after the upgrade. If this is needed, the Kurtosis CLI will prompt you with an error like so:
```
The engine server API version that the CLI expects, 1.7.4, doesn't match the running engine server API version, 1.6.8; this would cause broken functionality so you'll need to restart the engine to get the correct version by running 'kurtosis engine restart'
```
The fix is to restart the engine like so:
```
kurtosis engine restart
```

<details>
<summary>Homebrew</summary>

```
brew upgrade kurtosis-tech/tap/kurtosis-cli
```
</details>

<details>
<summary>apt</summary>

```
apt install --only-upgrade kurtosis-cli
```
</details>

<details>
<summary>yum</summary>

```
yum upgrade kurtosis-cli
```
</details>

<details>
<summary>deb, rpm, and apk</summary>

Download the appropriate artifact from [the release artifacts page][release-artifacts].
</details>

<!-------------------------- ONLY LINKS BELOW HERE ---------------------------->
[installing-tab-completion]: ./adding-tab-completion.md
[release-artifacts]: https://github.com/kurtosis-tech/kurtosis-cli-release-artifacts/releases
[cli-changelog]: https://docs.kurtosistech.com/kurtosis-cli/changelog
