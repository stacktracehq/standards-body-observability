{
  description = "Observability standards body repository";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    ts-toolchain.url = "git+ssh://git@github.com/stacktracehq/flakes?dir=ts-toolchain";
  };

  outputs =
    {
      nixpkgs,
      ts-toolchain,
      ...
    }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
      pkgsFor = system: import nixpkgs { inherit system; };
    in
    {
      devShells = forAllSystems (system: {
        default =
          let
            pkgs = pkgsFor system;
          in
          pkgs.mkShell {
            buildInputs = [
              ts-toolchain.packages.${system}.default
              pkgs.git
              pkgs.nodePackages.typescript-language-server
            ];

            shellHook = ''
              REPO=$(git rev-parse --show-toplevel)
              export PATH="$REPO/bin:$PATH"

              if [ -f "$REPO/.env" ]; then
                set -a
                source "$REPO/.env"
                set +a
              fi

              run --completion bash > .cli-completion.bash

              export NIX_DEVELOP_READY=1
            '';
          };
      });

      formatter = forAllSystems (system: (pkgsFor system).nixfmt);
    };
}
