// @flow
import { MainIpcChannel } from './lib/MainIpcChannel';
import {
  BCC_FAULT_INJECTION_CHANNEL,
  BCC_RESTART_CHANNEL,
  BCC_STATE_CHANNEL,
  GET_CACHED_BCC_STATUS_CHANNEL,
  BCC_TLS_CONFIG_CHANNEL,
  BCC_AWAIT_UPDATE_CHANNEL,
  SET_CACHED_BCC_STATUS_CHANNEL,
  EXPORT_WALLETS_CHANNEL,
} from '../../common/ipc/api';
import type {
  BccAwaitUpdateMainResponse,
  BccAwaitUpdateRendererRequest,
  BccFaultInjectionMainResponse,
  BccFaultInjectionRendererRequest,
  BccRestartMainResponse,
  BccRestartRendererRequest,
  BccStateRendererResponse,
  BccStateRendererRequest,
  BccTlsConfigMainResponse,
  BccTlsConfigRendererRequest,
  GetCachedBccStatusRendererRequest,
  GetCachedBccStatusMainResponse,
  SetCachedBccStatusRendererRequest,
  SetCachedBccStatusMainResponse,
  ExportWalletsRendererRequest,
  ExportWalletsMainResponse,
} from '../../common/ipc/api';

// IpcChannel<Incoming, Outgoing>

export const bccRestartChannel: MainIpcChannel<
  BccRestartRendererRequest,
  BccRestartMainResponse
> = new MainIpcChannel(BCC_RESTART_CHANNEL);

export const bccTlsConfigChannel: MainIpcChannel<
  BccTlsConfigRendererRequest,
  BccTlsConfigMainResponse
> = new MainIpcChannel(BCC_TLS_CONFIG_CHANNEL);

export const bccAwaitUpdateChannel: MainIpcChannel<
  BccAwaitUpdateRendererRequest,
  BccAwaitUpdateMainResponse
> = new MainIpcChannel(BCC_AWAIT_UPDATE_CHANNEL);

export const bccStateChangeChannel: MainIpcChannel<
  BccStateRendererRequest,
  BccStateRendererResponse
> = new MainIpcChannel(BCC_STATE_CHANNEL);

export const bccFaultInjectionChannel: MainIpcChannel<
  BccFaultInjectionRendererRequest,
  BccFaultInjectionMainResponse
> = new MainIpcChannel(BCC_FAULT_INJECTION_CHANNEL);

export const getCachedBccStatusChannel: MainIpcChannel<
  GetCachedBccStatusRendererRequest,
  GetCachedBccStatusMainResponse
> = new MainIpcChannel(GET_CACHED_BCC_STATUS_CHANNEL);

export const setCachedBccStatusChannel: MainIpcChannel<
  SetCachedBccStatusRendererRequest,
  SetCachedBccStatusMainResponse
> = new MainIpcChannel(SET_CACHED_BCC_STATUS_CHANNEL);

export const exportWalletsChannel: MainIpcChannel<
  ExportWalletsRendererRequest,
  ExportWalletsMainResponse
> = new MainIpcChannel(EXPORT_WALLETS_CHANNEL);
