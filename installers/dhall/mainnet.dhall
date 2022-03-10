{ name         = "mainnet"
, keyPrefix    = "mainnet_wallet"
, relays       = "relays.bcc-mainnet.tbco.io"
, updateServer = "https://update-bcc-mainnet.tbco.io"
, installDirectorySuffix = ""
, macPackageSuffix       = ""
, walletPort             = 8090
, extraNodeArgs          = [ "--network", "mainnet" ] : List Text
}
