{ name         = "testnet"
, keyPrefix    = "testnet_wallet"
, relays       = "relays.bcc-testnet.tbcodev.io"
, updateServer = "http://updates-bcc-testnet.s3.amazonaws.com"
, installDirectorySuffix = " Testnet"
, macPackageSuffix       = "Testnet"
, walletPort             = 8094
, extraNodeArgs          = [ "--network", "testnet" ] : List Text
}
