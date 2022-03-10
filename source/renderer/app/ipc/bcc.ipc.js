// @flow
import type {
  BccNodeState,
  BccStatus,
  FaultInjectionIpcRequest,
} from '../../../common/types/bcc-node.types';
import { RendererIpcChannel } from './lib/RendererIpcChannel';
import {
  BCC_FAULT_INJECTION_CHANNEL,
  BCC_RESTART_CHANNEL,
  BCC_STATE_CHANNEL,
  GET_CACHED_BCC_STATUS_CHANNEL,
  BCC_TLS_CONFIG_CHANNEL,
  BCC_AWAIT_UPDATE_CHANNEL,
  SET_CACHED_BCC_STATUS_CHANNEL,
  EXPORT_WALLETS_CHANNEL,
} from '../../../common/ipc/api';
import type {
  BccTlsConfigMainResponse,
  BccTlsConfigRendererRequest,
  ExportWalletsMainResponse,
  ExportWalletsRendererRequest,
} from '../../../common/ipc/api';

// IpcChannel<Incoming, Outgoing>

export const bccTlsConfigChannel: RendererIpcChannel<
  BccTlsConfigMainResponse,
  BccTlsConfigRendererRequest
> = new RendererIpcChannel(BCC_TLS_CONFIG_CHANNEL);

export const restartBccNodeChannel: RendererIpcChannel<
  void,
  void
> = new RendererIpcChannel(BCC_RESTART_CHANNEL);

export const bccStateChangeChannel: RendererIpcChannel<
  BccNodeState,
  void
> = new RendererIpcChannel(BCC_STATE_CHANNEL);

export const awaitUpdateChannel: RendererIpcChannel<
  void,
  void
> = new RendererIpcChannel(BCC_AWAIT_UPDATE_CHANNEL);

export const bccFaultInjectionChannel: RendererIpcChannel<
  void,
  FaultInjectionIpcRequest
> = new RendererIpcChannel(BCC_FAULT_INJECTION_CHANNEL);

export const getCachedBccStatusChannel: RendererIpcChannel<
  ?BccStatus,
  ?BccStatus
> = new RendererIpcChannel(GET_CACHED_BCC_STATUS_CHANNEL);

export const setCachedBccStatusChannel: RendererIpcChannel<
  ?BccStatus,
  ?BccStatus
> = new RendererIpcChannel(SET_CACHED_BCC_STATUS_CHANNEL);

export const exportWalletsChannel: RendererIpcChannel<
  ExportWalletsMainResponse,
  ExportWalletsRendererRequest
> = new RendererIpcChannel(EXPORT_WALLETS_CHANNEL);
