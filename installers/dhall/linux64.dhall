\(cluster : ./cluster.type)      ->
let dataDir = "\${XDG_DATA_HOME}/Klarity/${cluster.name}"
in
{ name               = "linux64"
, installDirectory   = ""
, macPackageName     = "unused"
, x509ToolPath       = None Text
, nodeArgs           =
  { logsPrefix       = "${dataDir}/Logs"
  , topology         = None Text
  , updateLatestPath = None Text
  , statePath        = "${dataDir}/state"
  , tlsPath          = None Text
  }
, pass      =
  { statePath           = dataDir
  , workingDir          = dataDir
  , nodeBin             = "bcc-node"
  , walletBin           = "bcc-wallet"
  , klarityBin         = "klarity-frontend"
  , cliPath             = "bcc-cli"
  , nodeLogConfig       = None Text
  , nodeLogPath         = None Text
  , walletLogging       = False
  , frontendOnlyMode    = True

  -- todo, find some way to disable updates when unsandboxed?
  , updaterPath         = None Text
  , updaterArgs         = [] : List Text
  , updateArchive       = None Text
  , updateWindowsRunner = None Text

  , launcherLogsPrefix  = "${dataDir}/Logs/"
  }
}
