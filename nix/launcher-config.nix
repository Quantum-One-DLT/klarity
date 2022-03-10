{ backend ? "bcc"
, network ? "staging"
, os ? "linux"
, bccLib
, runCommand
, lib
, devShell ? false
, bcc-wallet-native
, runCommandNative
, topologyOverride ? null
, configOverride ? null
, genesisOverride ? null
}:

# Creates an attr set for a cluster containing:
# * launcherConfig (attr set)
# * installerConfig (attr set)
# * nodeConfigFiles
# * configFiles (launcher config + installer config)


let
  clusterOverrides = {
    mainnet_flight = {
      bccEnv = bccLib.environments.mainnet;
      cluster = "mainnet";
      networkName = "mainnet";
    };
    aurum_purple = {
      bccEnv = bccLib.environments.aurum-purple;
      cluster = "aurum-purple";
      networkName = "aurum-purple";
    };
  };
  dirSep = if os == "windows" then "\\" else "/";
  configDir = configFilesSource: {
    linux = configFilesSource;
    macos64 = if devShell then configFilesSource else "\${KLARITY_INSTALL_DIRECTORY}/../Resources";
    windows = "\${KLARITY_INSTALL_DIRECTORY}";
  };

  isDevOrLinux = devShell || os == "linux";

  mkSpacedName = network: "Klarity ${installDirectorySuffix}";
  spacedName = mkSpacedName network;

  frontendBinPath = let
    frontendBin.linux = "klarity-frontend";
    frontendBin.windows = "${spacedName}";
    frontendBin.macos64 = "Frontend";
  in frontendBin.${os};

  selfnodeConfig = rec {
    useColeWallet = true;
    private = false;
    networkConfig = import ./selfnode-config.nix;
    nodeConfig = networkConfig // bccLib.defaultLogConfig;
    consensusProtocol = networkConfig.Protocol;
    genesisFile = ../utils/bcc/selfnode/genesis.json;
    delegationCertificate = ../utils/bcc/selfnode/selfnode.cert;
    signingKey = ../utils/bcc/selfnode/selfnode.key;
    topology = ../utils/bcc/selfnode/selfnode-topology.json;
  };

  # Helper function to make a path to a binary
  mkBinPath = binary: let
    binDir = {
      macos64 = "\${KLARITY_INSTALL_DIRECTORY}";
      windows = "\${KLARITY_INSTALL_DIRECTORY}";
    };
    binary' = if binary == "frontend" then frontendBinPath else binary;
  in if isDevOrLinux then binary' else "${binDir.${os}}${dirSep}${binary'}${lib.optionalString (os == "windows") ".exe"}";
  # Helper function to make a path to a config file
  mkConfigPath = configSrc: configPath: "${(configDir configSrc).${os}}${dirSep}${configPath}";

  envCfg = let
    bccEnv = if __hasAttr network clusterOverrides
                 then clusterOverrides.${network}.bccEnv
                 else bccLib.environments.${network};
  in if network == "selfnode" then selfnodeConfig else bccEnv;
  kind = if network == "local" then "sophie" else if (envCfg.nodeConfig.Protocol == "RealPBFT" || envCfg.nodeConfig.Protocol == "Cole") then "cole" else "sophie";

  installDirectorySuffix = let
    supportedNetworks = {
      mainnet = "Mainnet";
      mainnet_flight = "Flight";
      selfnode = "Selfnode";
      local = "Local";
      staging = "Staging";
      testnet = "Testnet";
      sophie_qa = "Sophie QA";
      aurum_purple = "Aurum Purple";
    };
    unsupported = "Unsupported";
    networkSupported = __hasAttr network supportedNetworks;
  in if networkSupported then supportedNetworks.${network} else unsupported;

  iconPath = let
    networkIconExists = __pathExists (../. + "/installers/icons/${network}");
    network' = if networkIconExists then network else "mainnet";
  in {
    small = ../installers/icons + "/${network'}/64x64.png";
    large = ../installers/icons + "/${network'}/1024x1024.png";
    base = ../installers/icons + "/${network'}";
  };

  dataDir = let
    path.linux = "\${XDG_DATA_HOME}/Klarity/${network}";
    path.macos64 = "\${HOME}/Library/Application Support/${spacedName}";
    path.windows = "\${APPDATA}\\${spacedName}";
  in path.${os};

  # Used for flight builds to find legacy paths for migration
  legacyDataDir = let
    path.linux = "\${XDG_DATA_HOME}/Klarity/mainnet";
    path.macos64 = "\${HOME}/Library/Application Support/Klarity";
    path.windows = "\${APPDATA}\\Klarity";
  in path.${os};

  logsPrefix = let
    path.linux = "${dataDir}/Logs";
    path.windows = "Logs";
    path.macos64 = "${dataDir}/Logs";
  in path.${os};

  tlsConfig = {
    ca = {
      organization = "Klarity";
      commonName = "Klarity Self-Signed Root CA";
      expiryDays = 3650;
    };
    server = {
      organization = "Klarity";
      commonName = "Klarity Wallet Backend";
      expiryDays = 365;
      altDNS = [
        "localhost"
        "localhost.localdomain"
        "127.0.0.1"
        "::1"
      ];
    };
    clients = [ {
      organization = "Klarity";
      commonName = "Klarity Frontend";
      expiryDays = 365;
    } ];
  };

  launcherLogsPrefix = "${logsPrefix}${dirSep}pub";

  # Default configs for launcher from bcc-shell. Most of these do nothing.
  # TODO: get rid of anything we don't need from bcc-shell
  defaultLauncherConfig = {
    inherit logsPrefix launcherLogsPrefix tlsConfig;
    walletLogging = false;
    klarityBin = mkBinPath "frontend";
    updateRunnerBin = mkBinPath "update-runner";
    # TODO: set when update system is complete
    updaterArgs = [];
    updaterPath = "";
    updateArchive = "";
    updateWindowsRunner = "";
    workingDir = dataDir;
    stateDir = dataDir;
    tlsPath = "${dataDir}${dirSep}tls";
    cluster = if __hasAttr network clusterOverrides then clusterOverrides.${network}.cluster else network;
    networkName = if __hasAttr network clusterOverrides then clusterOverrides.${network}.networkName else network;
    isFlight = network == "mainnet_flight";
    isStaging = (envCfg.nodeConfig.RequiresNetworkMagic == "RequiresNoMagic");
    nodeImplementation = backend;
  };

  mkConfigFiles = nodeConfigFiles: launcherConfig: installerConfig:
    runCommand "cfg-files" {
      launcherConfig = builtins.toJSON launcherConfig;
      installerConfig = builtins.toJSON installerConfig;
      passAsFile = [ "launcherConfig" "installerConfig" ];
    } ''
      mkdir $out
      cp ${nodeConfigFiles}/* $out/
      cp $launcherConfigPath $out/launcher-config.yaml
      cp $installerConfigPath $out/installer-config.json
      ${lib.optionalString (envCfg.nodeConfig ? ColeGenesisFile) "cp ${envCfg.nodeConfig.ColeGenesisFile} $out/genesis-cole.json"}
      ${lib.optionalString (envCfg.nodeConfig ? SophieGenesisFile) "cp ${envCfg.nodeConfig.SophieGenesisFile} $out/genesis-sophie.json"}
      ${lib.optionalString (envCfg.nodeConfig ? AurumGenesisFile) "cp ${envCfg.nodeConfig.AurumGenesisFile} $out/genesis-aurum.json"}
    '';

  mkConfigBcc = let
    filterMonitoring = config: if devShell then config else builtins.removeAttrs config [ "hasPrometheus" "hasEKG" ];
    bccAddressBin = mkBinPath "bcc-address";
    walletBin = mkBinPath "bcc-wallet";
    nodeBin = mkBinPath "bcc-node";
    cliBin = mkBinPath "bcc-cli";
    nodeConfig = let
      nodeConfigAttrs = if (configOverride == null) then envCfg.nodeConfig else __fromJSON (__readFile configOverride);
    in builtins.toJSON (filterMonitoring (nodeConfigAttrs // (lib.optionalAttrs (!isDevOrLinux || network == "local") {
      ColeGenesisFile = "genesis-cole.json";
      SophieGenesisFile = "genesis-sophie.json";
      AurumGenesisFile = "genesis-aurum.json";
    })));
    genesisFile = let
      genesisFile'.selfnode = ../utils/bcc/selfnode/genesis.json;
      genesisFile'.local = (__fromJSON nodeConfig).GenesisFile;
    in if (genesisOverride != null) then genesisOverride else if (network == "selfnode" || network == "local") then genesisFile'.${network} else envCfg.nodeConfig.ColeGenesisFile;
    normalTopologyFile = if network == "selfnode" then envCfg.topology else bccLib.mkEdgeTopology {
      inherit (envCfg) edgePort;
      edgeNodes = [ envCfg.relaysNew ];
    };
    localTopology = bccLib.mkEdgeTopology {
      edgePort = 30001;
      edgeNodes = [ "127.0.0.1" ];
    };
    topologyFile = if (topologyOverride == null) then (if network == "local" then localTopology else normalTopologyFile) else topologyOverride;
    nodeConfigFiles = runCommand "node-cfg-files" {
      inherit nodeConfig topologyFile;
      passAsFile = [ "nodeConfig" ];
    } ''
      mkdir $out
      cp ${genesisFile} $out/genesis.json
      cp $nodeConfigPath $out/config.yaml
      cp $topologyFile $out/topology.yaml
      ${lib.optionalString (network == "selfnode") ''
        cp ${envCfg.delegationCertificate} $out/delegation.cert
        cp ${envCfg.signingKey} $out/signing.key
      ''}
    '';

    legacyStateDir = if (network == "mainnet_flight") || (network == "mainnet") then legacyDataDir else dataDir;

    legacyWalletDB = let
      path.linux = "Wallet";
      path.macos64 = "Wallet-1.0";
      path.windows = "Wallet-1.0";
    in path.${os};

    legacySecretKey = let
      path.linux = "Secrets${dirSep}secret.key";
      path.macos64 = "Secrets-1.0${dirSep}secret.key";
      path.windows = "Secrets-1.0${dirSep}secret.key";
    in path.${os};

    launcherConfig = defaultLauncherConfig // {
      inherit
        nodeBin
        cliBin
        walletBin
        bccAddressBin
        legacyStateDir
        legacyWalletDB
        legacySecretKey;
      syncTolerance = "300s";
      nodeConfig = {
        inherit kind;
        configurationDir = "";
        network = {
          configFile = mkConfigPath nodeConfigFiles "config.yaml";
          genesisFile = mkConfigPath nodeConfigFiles "genesis.json";
          topologyFile = mkConfigPath nodeConfigFiles "topology.yaml";
        };
      };
    } // (lib.optionalAttrs (network == "selfnode") {
      selfnodeBin = mkBinPath "local-cluster";
      mockTokenMetadataServerBin = mkBinPath "mock-token-metadata-server";
    }) // (lib.optionalAttrs (__hasAttr "smashUrl" envCfg) {
      smashUrl = envCfg.smashUrl;
    }) // (lib.optionalAttrs (__hasAttr "metadataUrl" envCfg) {
      metadataUrl = envCfg.metadataUrl;
    });

    installerConfig = {
      installDirectory = if os == "linux" then "Klarity/${network}" else spacedName;
      inherit spacedName iconPath;
      macPackageName = "Klarity${network}";
      dataDir = dataDir;
      installerWinBinaries = [
        "bcc-launcher.exe"
        "bcc-node.exe"
        "bcc-wallet.exe"
        "bcc-cli.exe"
        "bcc-address.exe"
      ];
    };

  in {
    inherit nodeConfigFiles launcherConfig installerConfig;
    configFiles = mkConfigFiles nodeConfigFiles launcherConfig installerConfig;
  };

  configs.bcc = mkConfigBcc;
in configs.${backend}
