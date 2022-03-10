\(cluster : ./cluster.type)      ->
   let installDir = "Klarity${cluster.installDirectorySuffix}"
in let dataDir = "\${APPDATA}\\${installDir}"
    --
    --
in
{ name               = "win64"
, installDirectory   = installDir
, macPackageName     = "unused"
, x509ToolPath       = None Text
, nodeArgs           =
  { logsPrefix       = "Logs"
  , topology         = None Text
  , updateLatestPath = None Text
  , statePath        = "state"
  , tlsPath          = None Text
  }
, pass      =
  { statePath           = dataDir
  , workingDir          = dataDir
  , nodeBin             = "\${KLARITY_INSTALL_DIRECTORY}\\bcc-node.exe"
  , walletBin           = "\${KLARITY_INSTALL_DIRECTORY}\\bcc-wallet.exe"
  , klarityBin         = "\${KLARITY_INSTALL_DIRECTORY}\\${installDir}.exe"
  , cliPath             = "\${KLARITY_INSTALL_DIRECTORY}\\bcc-cli.exe"
  , nodeLogConfig       = None Text
  , nodeLogPath         = None Text

  , walletLogging       = True
  , frontendOnlyMode    = True

  , updaterPath         = None Text
  , updaterArgs         = [] : List Text
  , updateArchive       = None Text
  , updateWindowsRunner = Some "Installer.bat"

  , launcherLogsPrefix  = "Logs\\pub"
  }
}
