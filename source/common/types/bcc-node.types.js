// @flow
export type TlsConfig = {
  hostname: string,
  port: number,
  ca: Uint8Array,
  cert: Uint8Array,
  key: Uint8Array,
};

export type BccNodeImplementations = 'bcc' | 'selfnode';

export const BccNodeImplementationOptions: {
  BCC: BccNodeImplementations,
  SELFNODE: BccNodeImplementations,
} = {
  BCC: 'bcc',
  SELFNODE: 'selfnode',
};

export type NetworkNames =
  | 'mainnet'
  | 'testnet'
  | 'staging'
  | 'sophie_qa'
  | 'aurum_purple'
  | 'selfnode'
  | 'development'
  | string;

export type PlatformNames = 'win32' | 'linux' | 'darwin' | string;

export const NetworkNameOptions = {
  mainnet: 'mainnet',
  testnet: 'testnet',
  staging: 'staging',
  sophie_qa: 'sophie_qa',
  aurum_purple: 'aurum_purple',
  selfnode: 'selfnode',
  development: 'development',
};

export type BccNodeState =
  | 'starting'
  | 'running'
  | 'exiting'
  | 'stopping'
  | 'stopped'
  | 'updating'
  | 'updated'
  | 'crashed'
  | 'errored'
  | 'unrecoverable';

export const BccNodeStates: EnumMap<string, BccNodeState> = {
  STARTING: 'starting',
  RUNNING: 'running',
  EXITING: 'exiting',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  UPDATING: 'updating',
  UPDATED: 'updated',
  CRASHED: 'crashed',
  ERRORED: 'errored',
  UNRECOVERABLE: 'unrecoverable',
};

export type BccPidOptions =
  | 'mainnet-PREVIOUS-BCC-PID'
  | 'testnet-PREVIOUS-BCC-PID'
  | 'staging-PREVIOUS-BCC-PID'
  | 'sophie_qa-PREVIOUS-BCC-PID'
  | 'aurum_purple-PREVIOUS-BCC-PID'
  | 'selfnode-PREVIOUS-BCC-PID'
  | 'development-PREVIOUS-BCC-PID'
  | string;

export type BccNodeStorageKeys = {
  PREVIOUS_BCC_PID: BccPidOptions,
};

export type BccNodeProcessNames =
  | 'bcc-node'
  | 'bcc-node.exe'
  | 'local-cluster'
  | 'local-cluster.exe';

export type ProcessNames = {
  BCC_PROCESS_NAME: BccNodeProcessNames,
};

export const BccProcessNameOptions: {
  [BccNodeImplementations]: {
    win32: BccNodeProcessNames,
    linux: BccNodeProcessNames,
    darwin: BccNodeProcessNames,
  },
} = {
  bcc: {
    win32: 'bcc-node.exe',
    linux: 'bcc-node',
    darwin: 'bcc-node',
  },
  selfnode: {
    win32: 'local-cluster.exe',
    linux: 'local-cluster',
    darwin: 'local-cluster',
  },
};

/**
 * Expected fault injection types that can be used to tell
 * bcc-node to behave faulty (useful for testing)
 */
export type FaultInjection =
  | 'FInjIgnoreShutdown'
  | 'FInjIgnoreAPI'
  | 'FInjApplyUpdateNoExit'
  | 'FInjApplyUpdateWrongExitCode';

export const FaultInjections: {
  IgnoreShutdown: FaultInjection,
  IgnoreApi: FaultInjection,
  ApplyUpdateNoExit: FaultInjection,
  ApplyUpdateWrongExitCode: FaultInjection,
} = {
  IgnoreShutdown: 'FInjIgnoreShutdown',
  IgnoreApi: 'FInjIgnoreAPI',
  ApplyUpdateNoExit: 'FInjApplyUpdateNoExit',
  ApplyUpdateWrongExitCode: 'FInjApplyUpdateWrongExitCode',
};

export type FaultInjectionIpcResponse = Array<FaultInjection>;
export type FaultInjectionIpcRequest = [FaultInjection, boolean];

export type BccStatus = {
  isNodeResponding: boolean,
  isNodeSyncing: boolean,
  isNodeInSync: boolean,
  hasBeenConnected: boolean,
  bccNodePID: number,
  bccWalletPID: number,
};

// Bcc Mainet network magic
export const MAINNET_MAGIC = [1, null];

// Bcc Cole Testnet network magic
export const TESTNET_MAGIC = [1097911063, 0];

// Bcc Staging network magic
export const STAGING_MAGIC = [633343913, 1];

// Bcc Aurum Purple network magic
export const AURUM_PURPLE_MAGIC = [8, 0];

// Bcc Selfnode network magic
export const SELFNODE_MAGIC = MAINNET_MAGIC;
