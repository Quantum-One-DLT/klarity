{ pkgs, klarity-bridge }:

with pkgs;
with haskell.lib;

self: super: {
  klarity-installer = overrideCabal super.klarity-installer ( drv: { testToolDepends = [
      coreutils
      (writeShellScriptBin "klarity-bridge" "echo ${klarity-bridge}")
      (buildEnv {
        name = "test-stubs";
        paths = let
          stub = prog: script: writeShellScriptBin prog ''
            set -e
            (>&2 echo $0 "$@")
            ${script}
          '';
        in [
          (stub "sudo" "exec $@")
          (stub "yarn" ''
            mkdir -p dist release/darwin-x64/Klarity-darwin-x64/Klarity.app/Contents/MacOS
            touch release/darwin-x64/Klarity-darwin-x64/Klarity.app/Contents/MacOS/Klarity
            touch dist/index.html
          '')
          (stub "iconutil" "exit 0")
          (stub "pkgbuild" ''
            touch "''${@: -1}"  # last argument on command line
          '')
          (stub "productbuild" ''
            test -f $4
            touch $5
          '')
          (stub "pkgutil" "exit 0")
          (stub "security" "exit 0")
          (stub "productsign" ''
            set -x
            cp "''${@: -2}"
          '')
          (stub "otool" "echo")
          (stub "nix-store" "exit 0")
          (stub "install_name_tool" "exit 0")
        ];
      })
    ];
  });
}
