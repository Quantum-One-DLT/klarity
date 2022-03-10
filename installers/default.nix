{ system ? builtins.currentSystem
, config ? {}
, localLib ? import ../lib.nix {}
, pkgs
, klarity-bridge
}:

let
  haskellPackages = pkgs.haskellPackages.override {
    overrides = import ./overlays/required.nix { inherit pkgs; };
  };
  #haskellPackages = haskellPackages1.extend (import ./overlays/add-test-stubs.nix { inherit pkgs klarity-bridge; });

in haskellPackages // { inherit pkgs; }
