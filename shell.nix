{ system ? builtins.currentSystem
, config ? {}
, nodeImplementation ? "bcc"
, localLib ? import ./lib.nix { inherit nodeImplementation; }
, pkgs ? localLib.tbcoNix.getPkgs { inherit system config; }
, cluster ? "selfnode"
, systemStart ? null
, autoStartBackend ? systemStart != null
, walletExtraArgs ? []
, allowFaultInjection ? false
, purgeNpmCache ? false
, topologyOverride ? null
, configOverride ? null
, genesisOverride ? null
, useLocalNode ? false
, nivOnly ? false
}:

let
  klarityPkgs = import ./. {
    inherit nodeImplementation cluster topologyOverride configOverride genesisOverride useLocalNode;
    target = system;
    devShell = true;
  };
  hostPkgs = import pkgs.path { config = {}; overlays = []; };
  fullExtraArgs = walletExtraArgs ++ pkgs.lib.optional allowFaultInjection "--allow-fault-injection";
  launcherConfig' = "${klarityPkgs.klarity.cfg}/etc/launcher-config.yaml";
  fixYarnLock = pkgs.stdenv.mkDerivation {
    name = "fix-yarn-lock";
    buildInputs = [ klarityPkgs.nodejs klarityPkgs.yarn pkgs.git ];
    shellHook = ''
      git diff > pre-yarn.diff
      yarn
      git diff > post-yarn.diff
      diff pre-yarn.diff post-yarn.diff > /dev/null
      if [ $? != 0 ]
      then
        echo "Changes by yarn have been made. Please commit them."
      else
        echo "No changes were made."
      fi
      rm pre-yarn.diff post-yarn.diff
      exit
    '';
  };
  # This has all the dependencies of klarityShell, but no shellHook allowing hydra
  # to evaluate it.
  klarityShellBuildInputs = [
      klarityPkgs.nodejs
      klarityPkgs.yarn
      klarityPkgs.klarity-bridge
      klarityPkgs.klarity-installer
      klarityPkgs.darwin-launcher
      klarityPkgs.mock-token-metadata-server
    ] ++ (with pkgs; [
      nix bash binutils coreutils curl gnutar
      git python27 curl jq
      nodePackages.node-gyp nodePackages.node-pre-gyp
      gnumake
      chromedriver
      pkgconfig
      libusb
    ] ++ (localLib.optionals autoStartBackend [
      klarityPkgs.klarity-bridge
    ]) ++ (if (pkgs.stdenv.hostPlatform.system == "x86_64-darwin") then [
      darwin.apple_sdk.frameworks.CoreServices
    ] else [
      klarityPkgs.electron8
      winePackages.minimal
    ])
    ) ++ (pkgs.lib.optionals (nodeImplementation == "bcc") [
      debug.node
    ]);
  buildShell = pkgs.stdenv.mkDerivation {
    name = "klarity-build";
    buildInputs = klarityShellBuildInputs;
  };
  debug.node = pkgs.writeShellScriptBin "debug-node" (with klarityPkgs.launcherConfigs.launcherConfig; ''
    bcc-node run --topology ${nodeConfig.network.topologyFile} --config ${nodeConfig.network.configFile} --database-path ${stateDir}/chain --port 3001 --socket-path ${stateDir}/bcc-node.socket
  '');
  klarityShell = pkgs.stdenv.mkDerivation (rec {
    buildInputs = klarityShellBuildInputs;
    name = "klarity";
    buildCommand = "touch $out";
    LAUNCHER_CONFIG = launcherConfig';
    KLARITY_CONFIG = "${klarityPkgs.klarity.cfg}/etc/";
    KLARITY_INSTALL_DIRECTORY = "./";
    KLARITY_DIR = KLARITY_INSTALL_DIRECTORY;
    CLUSTER = cluster;
    NODE_EXE = "bcc-wallet";
    CLI_EXE = "bcc-cli";
    NODE_IMPLEMENTATION = nodeImplementation;
    shellHook = let
      secretsDir = if pkgs.stdenv.isLinux then "Secrets" else "Secrets-1.0";
    in ''
      warn() {
         (echo "###"; echo "### WARNING:  $*"; echo "###") >&2
      }

      ${localLib.optionalString pkgs.stdenv.isLinux "export XDG_DATA_HOME=$HOME/.local/share"}
      ${localLib.optionalString (cluster == "local") "export BCC_NODE_SOCKET_PATH=$(pwd)/state-cluster/bft1.socket"}
      source <(bcc-cli --bash-completion-script bcc-cli)
      source <(bcc-node --bash-completion-script bcc-node)
      source <(bcc-address --bash-completion-script bcc-address)
      [[ $(type -P bcc-wallet) ]] && source <(bcc-wallet --bash-completion-script bcc-wallet)

      cp -f ${klarityPkgs.iconPath.small} $KLARITY_INSTALL_DIRECTORY/icon.png

      # These links will only occur to binaries that exist for the
      # specific build config
      ln -svf $(type -P bcc-node)
      ln -svf $(type -P bcc-wallet)
      ln -svf $(type -P bcc-cli)
      mkdir -p Release/
      ln -sv $PWD/node_modules/usb/build/Release/usb_bindings.node Release/
      ln -sv $PWD/node_modules/node-hid/build/Release/HID.node Release/
      ${pkgs.lib.optionalString (nodeImplementation == "bcc") ''
        source <(bcc-node --bash-completion-script `type -p bcc-node`)
      ''}

      export NIX_CFLAGS_COMPILE="$NIX_CFLAGS_COMPILE -I${klarityPkgs.nodejs}/include/node -I${toString ./.}/node_modules/node-addon-api"
      ${localLib.optionalString purgeNpmCache ''
        warn "purging all NPM/Yarn caches"
        rm -rf node_modules
        yarn cache clean
        npm cache clean --force
        ''
      }
      yarn install
      ${localLib.optionalString pkgs.stdenv.isLinux ''
        ${pkgs.patchelf}/bin/patchelf --set-rpath ${pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc pkgs.udev ]} Release/usb_bindings.node
        ${pkgs.patchelf}/bin/patchelf --set-rpath ${pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc pkgs.udev ]} Release/HID.node
        ln -svf ${klarityPkgs.electron8}/bin/electron ./node_modules/electron/dist/electron
        ln -svf ${pkgs.chromedriver}/bin/chromedriver ./node_modules/electron-chromedriver/bin/chromedriver
      ''}
      echo 'jq < $LAUNCHER_CONFIG'
      echo debug the node by running debug-node
    '';
  });
  klarity = klarityShell.overrideAttrs (oldAttrs: {
    shellHook = ''
      ${oldAttrs.shellHook}
      yarn dev
      exit 0
    '';
  });
  devops = pkgs.stdenv.mkDerivation {
    name = "devops-shell";
    buildInputs = let
      inherit (localLib.tbcoNix) niv;
    in if nivOnly then [ niv ] else [ niv klarityPkgs.bcc-node-cluster.start klarityPkgs.bcc-node-cluster.stop ];
    shellHook = ''
      export BCC_NODE_SOCKET_PATH=$(pwd)/state-cluster/bft1.socket
      echo "DevOps Tools" \
      | ${pkgs.figlet}/bin/figlet -f banner -c \
      | ${pkgs.lolcat}/bin/lolcat

      echo "NOTE: you may need to export GITHUB_TOKEN if you hit rate limits with niv"
      echo "Commands:
        * niv update <package> - update package
        * start-cluster - start a development cluster
        * stop-cluster - stop a development cluster

      "
    '';
  };
in klarityShell // { inherit fixYarnLock buildShell devops; }
