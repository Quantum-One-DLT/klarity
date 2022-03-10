// @flow
export type CoreSystemInfo = {
  klarityVersion: string,
  klarityBuildNumber: string,
  klarityProcessID: string,
  klarityMainProcessID: string,
  isBlankScreenFixActive: boolean,
  bccNodeVersion: string,
  bccNodePID: number,
  bccWalletVersion: string,
  bccWalletPID: number,
  bccWalletApiPort: number,
  bccNetwork: string,
  klarityStateDirectoryPath: string,
};
