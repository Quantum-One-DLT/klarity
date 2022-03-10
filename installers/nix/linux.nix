{ stdenv, runCommand, writeText, writeScriptBin, electron8
, coreutils, utillinux, procps, cluster
, rawapp, klarity-bridge, klarity-installer
, sandboxed ? false
, nodeImplementation
, launcherConfigs
, linuxClusterBinName
, gsettings-desktop-schemas
, gtk3
, hicolor-icon-theme
, xfce
}:

let
  cluster' = launcherConfigs.launcherConfig.networkName;
  klarity-config = runCommand "klarity-config" {} ''
    mkdir -pv $out
    cd $out
    cp ${writeText "launcher-config.yaml" (builtins.toJSON launcherConfigs.launcherConfig)} $out/launcher-config.yaml
  '';
  # closure size TODO list
  # electron depends on cups, which depends on avahi
  klarity-frontend = writeScriptBin "klarity-frontend" ''
    #!${stdenv.shell}

    test -z "$XDG_DATA_HOME" && { XDG_DATA_HOME="''${HOME}/.local/share"; }
    export KLARITY_DIR="''${XDG_DATA_HOME}/Klarity"

    cd "''${KLARITY_DIR}/${cluster}/"

    exec ${electron8}/bin/electron --disable-setuid-sandbox --no-sandbox ${rawapp}/share/klarity "$@"
  '';
  klarity = writeScriptBin "klarity" ''
    #!${stdenv.shell}

    set -xe

    ${if sandboxed then ''
    '' else ''
      export PATH="${klarity-frontend}/bin/:${klarity-bridge}/bin:$PATH"
    ''}

    test -z "$XDG_DATA_HOME" && { XDG_DATA_HOME="''${HOME}/.local/share"; }
    export           CLUSTER=${cluster'}
    export      KLARITY_DIR="''${XDG_DATA_HOME}/Klarity"
    export   KLARITY_CONFIG=${if sandboxed then "/nix/var/nix/profiles/profile-${linuxClusterBinName}/etc" else klarity-config}
    export     XDG_DATA_DIRS=${gsettings-desktop-schemas}/share/gsettings-schemas/${gsettings-desktop-schemas.name}:${gtk3}/share/gsettings-schemas/${gtk3.name}:${hicolor-icon-theme}/share:${xfce.xfce4-icon-theme}/share

    mkdir -p "''${KLARITY_DIR}/${cluster}/"{Logs/pub,Secrets}
    cd "''${KLARITY_DIR}/${cluster}/"

    exec ${klarity-bridge}/bin/bcc-launcher \
      --config ${if sandboxed then "/nix/var/nix/profiles/profile-${linuxClusterBinName}/etc/launcher-config.yaml" else "${klarity-config}/launcher-config.yaml"}
  '';
  wrappedConfig = runCommand "launcher-config" {} ''
    mkdir -pv $out/etc/
    cp ${klarity-config}/* $out/etc/
  '';
in klarity // {
  cfg = wrappedConfig;
  inherit klarity-frontend;
}
