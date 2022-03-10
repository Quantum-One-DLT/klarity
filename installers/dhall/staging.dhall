{ name         = "staging"
, keyPrefix    = "mainnet_dryrun_wallet"
, relays       = "relays.awstest.tbcodev.io"
, updateServer = "https://update-awstest.tbcodev.io"
, installDirectorySuffix = " Staging"
, macPackageSuffix       = "Staging"
, walletPort             = 8092
, extraNodeArgs          = [ "--network", "staging" ] : List Text
}
