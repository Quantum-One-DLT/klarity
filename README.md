<blockquote>
<sub>Document maintainer: Nikola Glumac<br/>Document status: Active</sub>
</blockquote>

# Klarity
[![Build status](https://badge.buildkite.com/e173494257519752d79bb52c7859df6277c6d759b217b68384.svg?branch=master)](https://buildkite.com/The-Blockchain-Company/klarity)
[![Release](https://img.shields.io/github/release/The-Blockchain-Company/klarity.svg)](https://github.com/The-Blockchain-Company/klarity/releases)

Klarity - Cryptocurrency Wallet

## Installation

### Yarn

[Yarn](https://yarnpkg.com/lang/en/docs/install) is required to install `npm` dependencies to build Klarity.

### Nix

[Nix](https://nixos.org/nix/) is needed to run Klarity in `nix-shell`.

1. Install nix: `curl -L https://nixos.org/nix/install | sh` (use `sh <(curl -L https://nixos.org/nix/install) --darwin-use-unencrypted-nix-store-volume` on macOS Catalina)
2. Employ the signed TBCO binary cache:
   ```bash
   $ sudo mkdir -p /etc/nix
   $ sudo vi /etc/nix/nix.conf       # ..or any other editor, if you prefer
   ```
   and then add the following lines:
   ```
   substituters = https://hydra.tbco.io https://cache.nixos.org/
   trusted-substituters =
   trusted-public-keys = hydra.tbco.io:f/Ea+s+dFdN+3Y/G+FDgSq+a5NEWhJGzdjvKNGv0/EQ= cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=
   max-jobs = 2  # run at most two builds at once
   cores = 0     # the builder will use all available CPU cores
   extra-sandbox-paths = /System/Library/Frameworks
   ```
3. Run `nix-shell` with correct list of arguments or by using existing `package.json` scripts to load a shell with all the correct versions of all the required dependencies for development.

## Development

### Running Klarity with Bcc Node

#### Selfnode

1. Run `yarn nix:selfnode` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell` (use `KEEP_LOCAL_CLUSTER_RUNNING` environment variable to keep the local cluster running after Klarity exits: `KEEP_LOCAL_CLUSTER_RUNNING=true yarn dev`)
3. Once Klarity has started and has gotten past the loading screen run the following commands from a new terminal window if you wish to import funded wallets:
   - Cole wallets: `yarn cole:wallet:importer`
   - Sophie wallets: `yarn sophie:wallet:importer`
   - Jen wallets: `yarn jen:wallet:importer` (all of which contain native tokens which are visible once selfnode enters Jen era)
   - Yoroi Cole wallets: `yarn yoroi:wallet:importer`
   - _ITN Cole wallets:_ `yarn itn:cole:wallet:importer` **[Deprecated]**
   - _ITN Sophie wallets:_ `yarn itn:sophie:wallet:importer` **[Deprecated]**

   These scripts import 3 wallets by default. You can import up to 10 wallets by supplying `WALLET_COUNT` environment variable (e.g. `WALLET_COUNT=10 yarn jen:wallet:importer`).

   List of all funded wallet recovery phrases can be found here: https://github.com/The-Blockchain-Company/klarity/blob/develop/utils/api-importer/mnemonics.js

**Notes:**
- Bcc wallet process ID shown on the "Diagnostics" screen is faked and expected to match the Bcc node process ID.
- Stake pool metadata is fetched directly by default (TBCO SMASH server option is not available).
- Token metadata is fetched from a mock token metadata server which is automatically ran alongside the local cluster (there is no need to run it [manually](https://github.com/The-Blockchain-Company/klarity#native-token-metadata-server))
- Klarity will ask you if you wish to keep the local cluster running after it exits - this option is useful if you need to preserve local cluster state between Klarity restarts.

| Parameter | Value
| --- | ---
| slotLength | 0.2 sec
| epochLength | 50 slots
| desiredPoolNumber | 3
| minimumUtxoValue | 1 BCC

#### Mainnet

1. Run `yarn nix:mainnet` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell`

#### Flight

1. Run `yarn nix:flight` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell`

#### Testnet

1. Run `yarn nix:testnet` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell`

#### Staging

1. Run `yarn nix:staging` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell`

#### Sophie QA

1. Run `yarn nix:sophie_qa` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell`

#### Aurum Purple

1. Run `yarn nix:aurum_purple` from `klarity`.
2. Run `yarn dev` from the subsequent `nix-shell`

#### Native token metadata server

Klarity, by default, uses the following metadata server for all networks except for the mainnet: `https://metadata.bcc-testnet.tbcodev.io/`.

It's also possible to use a mock server locally by running the following command in `nix-shell` prior to starting Klarity:

```
$ mock-token-metadata-server --port 65432 ./utils/bcc/native-tokens/registry.json
Mock metadata server running with url http://localhost:65432/
```

Then proceed to launch Klarity and make sure to provide the mock token metadata server port:

```
$ MOCK_TOKEN_METADATA_SERVER_PORT=65432 yarn dev
```

This enables you to modify the metadata directly by modifying the registry file directly:

```
$ vi ./utils/bcc/native-tokens/registry.json        # ..or any other editor, if you prefer
```

Use the following command to check if the mock server is working correctly:

```
$ curl -i -H "Content-type: application/json" --data '{"subjects":["789ef8ae89617f34c07f7f6a12e4d65146f958c0bc15a97b4ff169f1"],"properties":["name","description","ticker","unit","logo"]}'
http://localhost:65432/metadata/query
```
... and expect a "200 OK" response.

### Updating upstream dependencies (bcc-wallet, bcc-node, and tbco-nix)

`Niv` is used to manage the version of upstream dependencies. The versions of these dependencies can be seen in `nix/sources.json`.

Dependencies are updated with the follow nix commands:
- Update bcc-wallet to the latest master: `nix-shell -A devops --arg nivOnly true --run "niv update bcc-wallet"`
- Update bcc-wallet to a specific revision: `nix-shell -A devops --arg nivOnly true --run "niv update bcc-wallet -a rev=91db88f9195de49d4fb4299c68fc3f6de09856ab"`
- Update bcc-node to a specific tag: `nix-shell -A devops --arg nivOnly true --run "niv update bcc-node -b tags/1.20.0"`
- Update tbco-nix to the latest master: `nix-shell -A devops --arg nivOnly true --run  "niv update tbco-nix -b master"`

#### Notes

`nix-shell` also provides a script for updating `yarn.lock` file:

    nix-shell -A fixYarnLock

### Bcc Wallet Api documentation

Api documentation for edge `bcc-wallet` version: https://The-Blockchain-Company.github.io/bcc-wallet/api/edge/

### Externals

If you use any 3rd party libraries which can't or won't be built with webpack, you must list them in your `source/main/webpack.config.js` and/or `source/renderer/webpack.config.js`：

```javascript
externals: [
  // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
]
```

For a common example, to install Bootstrap, `yarn install --save bootstrap` and link them in the head of app.html

```html
<link rel="stylesheet" href="../node_modules/bootstrap/dist/css/bootstrap.css" />
<link rel="image/svg+xml" href="../node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.eot" />
...
```

Make sure to list bootstrap in externals in `webpack.config.base.js` or the app won't include them in the package:
```js
externals: ['bootstrap']
```

## Testing

You can find more details regarding tests setup within
[Running Klarity acceptance tests](https://github.com/The-Blockchain-Company/klarity/blob/master/tests/README.md) README file.

**Notes:** Be aware that only a single Klarity instance can run per state directory.
So you have to exit any development instances before running tests!

## Packaging

```bash
$ yarn run package
```

To package apps for all platforms:

```bash
$ yarn run package:all
```

To package apps with options:

```bash
$ yarn run package -- --[option]
```

### Options

- --name, -n: Application name (default: Electron)
- --version, -v: Electron version (default: latest version)
- --asar, -a: [asar](https://github.com/atom/asar) support (default: false)
- --icon, -i: Application icon
- --all: pack for all platforms

Use `electron-packager` to pack your app with `--all` options for macOS, Linux and Windows platform. After build, you will find them in `release` folder. Otherwise, you will only find one for your OS.

## Automated builds

### CI/dev build scripts

Platform-specific build scripts facilitate building Klarity the way it is built by the TBCO CI:

#### Linux/macOS

This script requires [Nix](https://nixos.org/nix/), (optionally) configured with the [TBCO binary cache][cache].

    scripts/build-installer-unix.sh [OPTIONS..]

The result can be found at `installers/csl-klarity/klarity-*.pkg`.

[cache]: https://github.com/The-Blockchain-Company/bcc-sl/blob/3dbe220ae108fa707b55c47e689ed794edf5f4d4/docs/how-to/build-bcc-sl-and-klarity-from-source-code.md#nix-build-mode-recommended

#### Windows

This batch file requires [Node.js](https://nodejs.org/en/download/) and
[7zip](https://www.7-zip.org/download.html).

    scripts/build-installer-win64.bat

The result will can be found at `.\klarity-*.exe`.

#### Pure Nix installer build

This will use nix to build a Linux installer. Using the [TBCO binary
cache][cache] will speed things up.

    nix build -f ./release.nix mainnet.installer

The result can be found at `./result/klarity-*.bin`.
