{ target, bccWalletPkgs, runCommandCC, bcc-wallet, bcc-node, bcc-shell, bcc-cli, bcc-address, lib, local-cluster ? null }:

let
  commonLib = import ../lib.nix {};
  pkgsCross = import bccWalletPkgs.path { crossSystem = bccWalletPkgs.lib.systems.examples.mingwW64; config = {}; overlays = []; };
in runCommandCC "klarity-bcc-bridge" {
  passthru = {
    node-version = bcc-node.passthru.identifier.version;
    wallet-version = bcc-wallet.version;
  };
} ''
  mkdir -pv $out/bin
  cd $out/bin
  echo ${bcc-wallet.version} > $out/version
  cp ${bcc-wallet}/bin/* .
  cp -f ${bcc-address}/bin/bcc-address* .
  cp -f ${bcc-shell.haskellPackages.bcc-launcher.components.exes.bcc-launcher}/bin/bcc-launcher* .
  cp -f ${bcc-node}/bin/bcc-node* .
  cp -f ${bcc-cli}/bin/bcc-cli* .
  ${lib.optionalString (local-cluster != null) "cp -f ${local-cluster}/bin/local-cluster* ."}
  ${lib.optionalString (target == "x86_64-linux") ''
    chmod +w -R .
    for x in bcc-address bcc-node bcc-launcher bcc-cli bcc-wallet; do
      $STRIP $x
      patchelf --shrink-rpath $x
    done
  ''}
''
