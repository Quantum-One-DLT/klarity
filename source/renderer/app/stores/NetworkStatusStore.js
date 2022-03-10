// @flow
import { observable, action, computed, runInAction } from 'mobx';
import moment from 'moment';
import { isEqual, includes, get } from 'lodash';
import Store from './lib/Store';
import Request from './lib/LocalizedRequest';
import {
  ALLOWED_TIME_DIFFERENCE,
  NETWORK_STATUS_POLL_INTERVAL,
  NETWORK_CLOCK_POLL_INTERVAL,
  MAX_ALLOWED_STALL_DURATION,
  DECENTRALIZATION_LEVEL_POLLING_INTERVAL,
} from '../config/timingConfig';
import { INITIAL_DESIRED_POOLS_NUMBER } from '../config/stakingConfig';
import { logger } from '../utils/logging';
import {
  bccStateChangeChannel,
  bccTlsConfigChannel,
  restartBccNodeChannel,
  getCachedBccStatusChannel,
  setCachedBccStatusChannel,
} from '../ipc/bcc.ipc';
import { BccNodeStates } from '../../../common/types/bcc-node.types';
import { getDiskSpaceStatusChannel } from '../ipc/getDiskSpaceChannel';
import { getBlockReplayProgressChannel } from '../ipc/getBlockReplayChannel';
import { getStateDirectoryPathChannel } from '../ipc/getStateDirectoryPathChannel';
import type {
  GetNetworkInfoResponse,
  GetNetworkClockResponse,
  GetNetworkParametersResponse,
  NextEpoch,
  FutureEpoch,
  TipInfo,
} from '../api/network/types';
import type {
  BccNodeState,
  BccStatus,
  TlsConfig,
} from '../../../common/types/bcc-node.types';
import type { CheckDiskSpaceResponse } from '../../../common/types/no-disk-space.types';
import { TlsCertificateNotValidError } from '../api/nodes/errors';
import { openLocalDirectoryChannel } from '../ipc/open-local-directory';

// DEFINE CONSTANTS -------------------------
const NETWORK_STATUS = {
  CONNECTING: 0,
  SYNCING: 1,
  RUNNING: 2,
};

const NODE_STOPPING_STATES = [
  BccNodeStates.EXITING,
  BccNodeStates.STOPPING,
  BccNodeStates.UPDATING,
];

const NODE_STOPPED_STATES = [
  BccNodeStates.CRASHED,
  BccNodeStates.ERRORED,
  BccNodeStates.STOPPED,
  BccNodeStates.UPDATED,
  BccNodeStates.UNRECOVERABLE,
];
// END CONSTANTS ----------------------------

const { isFlight } = global;

export default class NetworkStatusStore extends Store {
  // Initialize store properties
  _startTime = Date.now();
  _networkStatus = NETWORK_STATUS.CONNECTING;
  _networkStatusPollingInterval: ?IntervalID = null;
  _networkClockPollingInterval: ?IntervalID = null;
  _networkParametersPollingInterval: ?IntervalID = null;

  // Initialize store observables

  // Internal Node states
  @observable tlsConfig: ?TlsConfig = null;
  @observable bccNodeState: ?BccNodeState = null;
  @observable bccNodePID: number = 0;
  @observable bccWalletPID: number = 0;
  @observable isNodeResponding = false; // Is 'true' as long we are receiving node Api responses
  @observable isNodeSyncing = false; // Is 'true' in case we are receiving blocks and not stalling
  @observable isNodeInSync = false; // Is 'true' if syncing & local/network blocks diff within limit
  @observable isNodeStopping = false; // Is 'true' if node is in `NODE_STOPPING_STATES` states
  @observable isNodeStopped = false; // Is 'true' if node is in `NODE_STOPPED_STATES` states
  @observable isNodeTimeCorrect = true; // Is 'true' in case local and global time are in sync
  @observable isSystemTimeIgnored = false; // Tracks if NTP time checks are ignored
  @observable isSplashShown = isFlight; // Visibility of splash screen
  @observable isSyncProgressStalling = false; // Is 'true' in case sync progress doesn't change within limit

  @observable hasBeenConnected = false;
  @observable syncProgress = null;
  @observable localTip: ?TipInfo = null;
  @observable networkTip: ?TipInfo = null;
  @observable nextEpoch: ?NextEpoch = null;
  @observable futureEpoch: ?FutureEpoch = null;
  @observable lastSyncProgressChangeTimestamp = 0; // milliseconds
  @observable localTimeDifference: ?number = 0; // microseconds
  @observable decentralizationProgress: number = 0; // percentage
  @observable desiredPoolNumber: number = INITIAL_DESIRED_POOLS_NUMBER;

  @observable
  getNetworkInfoRequest: Request<GetNetworkInfoResponse> = new Request(
    this.api.bcc.getNetworkInfo
  );
  @observable
  getNetworkClockRequest: Request<GetNetworkClockResponse> = new Request(
    this.api.bcc.getNetworkClock
  );
  @observable
  getNetworkParametersRequest: Request<GetNetworkParametersResponse> = new Request(
    this.api.bcc.getNetworkParameters
  );

  @observable isNotEnoughDiskSpace: boolean = false;
  @observable diskSpaceRequired: string = '';
  @observable diskSpaceMissing: string = '';
  @observable diskSpaceRecommended: string = '';
  @observable diskSpaceAvailable: string = '';
  @observable isTlsCertInvalid: boolean = false;
  @observable stateDirectoryPath: string = '';
  @observable isSophieActivated: boolean = false;
  @observable isSophiePending: boolean = false;
  @observable isAurumActivated: boolean = false;
  @observable sophieActivationTime: string = '';
  @observable isAurumActivated: boolean = false;
  @observable isAurumPending: boolean = false;
  @observable aurumActivationTime: string = '';
  @observable verificationProgress: number = 0;

  @observable epochLength: ?number = null; // unit: 1 slot
  @observable slotLength: ?number = null; // unit: 1 second

  // DEFINE STORE METHODS
  setup() {
    // ========== IPC CHANNELS =========== //

    const { networkStatus: networkStatusActions } = this.actions;

    networkStatusActions.restartNode.listen(this._restartNode);
    networkStatusActions.toggleSplash.listen(this._toggleSplash);
    networkStatusActions.forceCheckNetworkClock.listen(
      this._forceCheckNetworkClock
    );

    // Request node state
    this._requestBccState();

    // Request cached node status for fast bootstrapping of frontend
    this._requestBccStatus();

    // Passively receive broadcasted tls config changes (which can happen without requesting it)
    // E.g if the bcc-node restarted for some reason
    bccTlsConfigChannel.onReceive(this._updateTlsConfig);

    // Passively receive state changes of the bcc-node
    bccStateChangeChannel.onReceive(this._handleBccNodeStateChange);

    // ========== MOBX REACTIONS =========== //
    this.registerReactions([
      this._updateNetworkStatusWhenConnected,
      this._updateNetworkStatusWhenDisconnected,
      this._updateNodeStatus,
    ]);

    // Setup polling interval
    this._setNetworkStatusPollingInterval();
    this._setNetworkClockPollingInterval();
    this._setNetworkParametersPollingInterval();

    // Setup disk space checks
    getDiskSpaceStatusChannel.onReceive(this._onCheckDiskSpace);
    this._checkDiskSpace();

    this._getStateDirectoryPath();

    // Blockchain verification checking
    getBlockReplayProgressChannel.onReceive(this._onCheckVerificationProgress);
  }

  _restartNode = async () => {
    this._resetSystemTime();
    try {
      logger.info('NetworkStatusStore: Requesting a restart of bcc-node');
      await restartBccNodeChannel.send();
    } catch (error) {
      logger.error('NetworkStatusStore: Restart of bcc-node failed', {
        error,
      });
    }
  };

  teardown() {
    super.teardown();

    // Teardown polling intervals
    this._clearNetworkStatusPollingInterval();
    this._clearNetworkClockPollingInterval();
    this._clearNetworkParametersPollingInterval();
  }

  // ================= REACTIONS ==================

  _updateNetworkStatusWhenDisconnected = () => {
    if (!this.isConnected) {
      this._updateNetworkStatus();
      if (!this._networkClockPollingInterval) {
        this._setNetworkClockPollingInterval();
      }
    }
  };

  _updateNetworkStatusWhenConnected = () => {
    if (this.isConnected) {
      logger.info('NetworkStatusStore: Connected');
      this._updateNetworkStatus();
      this.actions.walletMigration.startMigration.trigger();
    }
  };

  _updateNodeStatus = async () => {
    if (this.environment.isTest && !this.isConnected) return;
    try {
      logger.info('NetworkStatusStore: Updating node status');
      await setCachedBccStatusChannel.send(this._extractNodeStatus(this));
    } catch (error) {
      logger.error('NetworkStatusStore: Error while updating node status', {
        error,
      });
    }
  };

  // =============== PRIVATE ===============

  _getStartupTimeDelta() {
    return Date.now() - this._startTime;
  }

  _checkDiskSpace(diskSpaceRequired?: number) {
    getDiskSpaceStatusChannel.send(diskSpaceRequired);
  }

  _getStateDirectoryPath = async () => {
    this._onReceiveStateDirectoryPath(
      await getStateDirectoryPathChannel.request()
    );
  };

  _requestBccState = async () => {
    logger.info('NetworkStatusStore: requesting node state');
    const state = await bccStateChangeChannel.request();
    logger.info(`NetworkStatusStore: handling node state <${state}>`, {
      state,
    });
    await this._handleBccNodeStateChange(state);
  };

  _requestBccStatus = async () => {
    try {
      logger.info('NetworkStatusStore: requesting node status');
      const status = await getCachedBccStatusChannel.request();
      logger.info('NetworkStatusStore: received cached node status', {
        status,
      });
      if (status)
        runInAction('assigning node status', () => Object.assign(this, status));
    } catch (error) {
      logger.error('NetworkStatusStore: error while requesting node state', {
        error,
      });
    }
  };

  _requestTlsConfig = async () => {
    try {
      logger.info(
        'NetworkStatusStore: requesting tls config from main process'
      );
      const tlsConfig = await bccTlsConfigChannel.request();
      await this._updateTlsConfig(tlsConfig);
    } catch (error) {
      logger.error('NetworkStatusStore: error while requesting tls config', {
        error,
      });
    }
  };

  // $FlowFixMe
  _updateTlsConfig = (config: ?TlsConfig): Promise<void> => {
    if (config == null || isEqual(config, this.tlsConfig))
      return Promise.resolve();
    logger.info('NetworkStatusStore: received tls config from main process');
    this.api.bcc.setRequestConfig(config);
    runInAction('updating tlsConfig', () => {
      this.tlsConfig = config;
    });
    this.actions.networkStatus.tlsConfigIsReady.trigger();
    return Promise.resolve();
  };

  _handleBccNodeStateChange = async (state: BccNodeState) => {
    if (state === this.bccNodeState) return Promise.resolve();
    logger.info(`NetworkStatusStore: handling bcc-node state <${state}>`, {
      state,
    });
    const wasConnected = this.isConnected;
    switch (state) {
      case BccNodeStates.STARTING:
        break;
      case BccNodeStates.RUNNING:
        await this._requestTlsConfig();
        await this._requestBccStatus();
        break;
      case BccNodeStates.STOPPING:
      case BccNodeStates.EXITING:
      case BccNodeStates.UPDATING:
        runInAction('updating tlsConfig', () => {
          this.tlsConfig = null;
        });
        this._setDisconnected(wasConnected);
        this.stores.app._closeActiveDialog();
        break;
      default:
        this._setDisconnected(wasConnected);
    }
    runInAction('setting bccNodeState', () => {
      this.bccNodeState = state;
      this.isNodeStopping = includes(NODE_STOPPING_STATES, state);
      this.isNodeStopped = includes(NODE_STOPPED_STATES, state);
    });
    return Promise.resolve();
  };

  _extractNodeStatus = (from: Object & BccStatus): BccStatus => {
    const {
      isNodeResponding,
      isNodeSyncing,
      isNodeInSync,
      hasBeenConnected,
      bccNodePID,
      bccWalletPID,
    } = from;

    return {
      isNodeResponding,
      isNodeSyncing,
      isNodeInSync,
      hasBeenConnected,
      bccNodePID,
      bccWalletPID,
    };
  };

  // DEFINE ACTIONS

  @action _setNetworkStatusPollingInterval = () => {
    this._networkStatusPollingInterval = setInterval(
      this._updateNetworkStatus,
      NETWORK_STATUS_POLL_INTERVAL
    );
  };

  @action _setNetworkClockPollingInterval = () => {
    this._networkClockPollingInterval = setInterval(
      this._updateNetworkClock,
      NETWORK_CLOCK_POLL_INTERVAL
    );
  };

  @action _setNetworkParametersPollingInterval = () => {
    this._networkParametersPollingInterval = setInterval(
      this._getNetworkParameters,
      DECENTRALIZATION_LEVEL_POLLING_INTERVAL
    );
  };

  @action _clearNetworkStatusPollingInterval = () => {
    if (this._networkStatusPollingInterval) {
      clearInterval(this._networkStatusPollingInterval);
      this._networkStatusPollingInterval = null;
    }
  };

  @action _clearNetworkClockPollingInterval = () => {
    if (this._networkClockPollingInterval) {
      clearInterval(this._networkClockPollingInterval);
      this._networkClockPollingInterval = null;
    }
  };

  @action _clearNetworkParametersPollingInterval = () => {
    if (this._networkParametersPollingInterval) {
      clearInterval(this._networkParametersPollingInterval);
      this._networkParametersPollingInterval = null;
    }
  };

  @action ignoreSystemTimeChecks = (flag: boolean = true) => {
    this.isSystemTimeIgnored = flag;
  };

  @action _forceCheckNetworkClock = () => {
    logger.info('NetworkStatusStore: Force checking network clock...');
    this._updateNetworkClock(true);
  };

  @action _updateNetworkClock = async (isForceCheck: boolean = false) => {
    // Skip checking network clock if we are not connected or system time is ignored
    if (!this.isNodeResponding || (this.isSystemTimeIgnored && !isForceCheck))
      return;

    // Cancel check if one is already running, unless we are trying to execute a force
    // check in which case we need to wait for previous request to be executed
    if (this.getNetworkClockRequest.isExecuting) {
      if (isForceCheck) {
        await this.getNetworkClockRequest;
      } else {
        return;
      }
    }

    logger.info('NetworkStatusStore: Checking network clock...', {
      isForceCheck,
    });
    try {
      const networkClock: GetNetworkClockResponse = await this.getNetworkClockRequest.execute(
        { isForceCheck }
      ).promise;
      // System time is correct if local time difference is below allowed threshold
      runInAction('update localTimeDifference and isNodeTimeCorrect', () => {
        // Update localTimeDifference only in case NTP check status is not still pending
        if (networkClock.status !== 'pending') {
          this.localTimeDifference = networkClock.offset;
          this.isNodeTimeCorrect =
            this.localTimeDifference != null && // If we receive 'null' it means NTP check failed
            Math.abs(this.localTimeDifference) <= ALLOWED_TIME_DIFFERENCE;
          this._clearNetworkClockPollingInterval();
        }
      });
      logger.info('NetworkStatusStore: Network clock response received', {
        localTimeDifference: this.localTimeDifference,
        isNodeTimeCorrect: this.isNodeTimeCorrect,
        allowedDifference: ALLOWED_TIME_DIFFERENCE,
        isForceCheck,
      });
    } catch (error) {} // eslint-disable-line
  };

  @action _updateNetworkStatus = async () => {
    // In case we haven't received TLS config we shouldn't trigger any API calls
    if (!this.tlsConfig) return;

    // Record connection status before running network status call
    const wasConnected = this.isConnected;

    try {
      const networkStatus: GetNetworkInfoResponse = await this.getNetworkInfoRequest.execute()
        .promise;

      // In case we no longer have TLS config we ignore all API call responses
      // as this means we are in the Bcc shutdown (stopping|exiting|updating) sequence
      if (!this.tlsConfig) {
        logger.debug(
          'NetworkStatusStore: Ignoring NetworkStatusRequest result during Bcc shutdown sequence...'
        );
        return;
      }

      const { syncProgress, localTip, networkTip, nextEpoch } = networkStatus;
      let futureEpoch = null;

      if (nextEpoch && this.epochLength && this.slotLength) {
        const startDelta = this.epochLength * this.slotLength;
        futureEpoch = {
          epochNumber: nextEpoch.epochNumber ? nextEpoch.epochNumber + 1 : null,
          epochStart: nextEpoch.epochStart
            ? moment(nextEpoch.epochStart)
                .add(startDelta, 'seconds')
                .toISOString()
            : '',
        };
      }

      // We got response which means node is responding
      runInAction('update isNodeResponding', () => {
        this.isNodeResponding = true;
      });

      runInAction(
        'update localTip, networkTip, nextEpoch and futureEpoch',
        () => {
          this.localTip = localTip;
          this.networkTip = networkTip;
          this.nextEpoch = nextEpoch;
          this.futureEpoch = futureEpoch;
        }
      );

      if (this._networkStatus === NETWORK_STATUS.CONNECTING) {
        // We are connected for the first time, move on to syncing stage
        this._networkStatus = NETWORK_STATUS.SYNCING;
        const connectingTimeDelta = this._getStartupTimeDelta();
        logger.info(`Connected after ${connectingTimeDelta} milliseconds`, {
          connectingTimeDelta,
        });
      }

      // Update sync progress
      const lastSyncProgress = this.syncProgress;
      runInAction('update syncProgress', () => {
        this.syncProgress = syncProgress;
      });

      runInAction('update isNodeInSync', () => {
        this.isNodeInSync = this.syncProgress === 100;
      });

      runInAction('update isSyncProgressStalling', () => {
        // Check if sync progress is stalling
        const hasSyncProgressChanged = this.syncProgress !== lastSyncProgress;
        if (
          this.isNodeInSync || // Update last sync progress change timestamp if node is in sync
          hasSyncProgressChanged || // Sync progress change detected
          (!this.isSyncProgressStalling && // Guard against future timestamps / incorrect system time
            (this.lastSyncProgressChangeTimestamp > Date.now() ||
              (!this.isNodeTimeCorrect && !this.isSystemTimeIgnored)))
        ) {
          this.lastSyncProgressChangeTimestamp = Date.now(); // Record last sync progress change timestamp
        }
        const lastSyncProgressChangeStall = moment(Date.now()).diff(
          moment(this.lastSyncProgressChangeTimestamp)
        );
        this.isSyncProgressStalling =
          lastSyncProgressChangeStall > MAX_ALLOWED_STALL_DURATION;
      });

      runInAction('update isNodeSyncing', () => {
        this.isNodeSyncing = !this.isSyncProgressStalling;
      });

      if (this._networkStatus === NETWORK_STATUS.SYNCING && this.isNodeInSync) {
        // We are synced for the first time, move on to running stage
        this._networkStatus = NETWORK_STATUS.RUNNING;
        this.actions.networkStatus.isSyncedAndReady.trigger();
        const syncingTimeDelta = this._getStartupTimeDelta();
        logger.info(`Synced after ${syncingTimeDelta} milliseconds`, {
          syncingTimeDelta,
        });
      }

      if (wasConnected !== this.isConnected) {
        if (!this.isConnected) {
          if (!this.hasBeenConnected) {
            runInAction('update hasBeenConnected', () => {
              this.hasBeenConnected = true;
            });
          }
          logger.debug('NetworkStatusStore: Connection Lost. Reconnecting...');
        } else if (this.hasBeenConnected) {
          // Make sure all wallets data is fully reloaded after the connection is re-established
          this.stores.wallets.resetWalletsData();
          logger.debug('NetworkStatusStore: Connection Restored');
        }
        if (this.isTlsCertInvalid) {
          runInAction('set isTlsCertInvalid = false', () => {
            this.isTlsCertInvalid = false;
          });
        }
      }

      // Reset request errors since we've received a valid response
      if (this.getNetworkInfoRequest.error !== null) {
        this.getNetworkInfoRequest.reset();
      }
    } catch (error) {
      // Node is not responding, switch to disconnected state
      this._setDisconnected(wasConnected);
      if (error instanceof TlsCertificateNotValidError) {
        runInAction('set isTlsCertInvalid = true', () => {
          this.isTlsCertInvalid = true;
        });
      }
    }
  };

  @action _setDisconnected = (wasConnected: boolean) => {
    this.isNodeResponding = false;
    this.isNodeSyncing = false;
    this.isNodeInSync = false;
    this._resetSystemTime();
    if (wasConnected) {
      if (!this.hasBeenConnected) {
        runInAction('update hasBeenConnected', () => {
          this.hasBeenConnected = true;
        });
      }
      logger.debug('NetworkStatusStore: Connection Lost. Reconnecting...');
    }
  };

  @action _getNetworkParameters = async () => {
    // Skip checking network parameters if we are not connected
    if (!this.isNodeResponding) return;

    try {
      const networkParameters: GetNetworkParametersResponse = await this.getNetworkParametersRequest.execute()
        .promise;
      let {
        isSophieActivated,
        isSophiePending,
        sophieActivationTime,
        isAurumActivated,
        isAurumPending,
        aurumActivationTime,
      } = this;
      const {
        decentralizationLevel,
        desiredPoolNumber,
        slotLength,
        epochLength,
        eras,
      } = networkParameters;

      if (eras) {
        const currentTimeStamp = new Date().getTime();

        sophieActivationTime = get(eras, 'sophie.epoch_start_time', '');
        if (sophieActivationTime !== '') {
          const sophieActivationTimeStamp = new Date(
            sophieActivationTime
          ).getTime();
          isSophieActivated = currentTimeStamp >= sophieActivationTimeStamp;
          isSophiePending = currentTimeStamp < sophieActivationTimeStamp;
        }

        aurumActivationTime = get(eras, 'aurum.epoch_start_time', '');
        if (aurumActivationTime !== '') {
          const aurumActivationTimeStamp = new Date(
            aurumActivationTime
          ).getTime();
          isAurumActivated = currentTimeStamp >= aurumActivationTimeStamp;
          isAurumPending = currentTimeStamp < aurumActivationTimeStamp;
        }
      }

      runInAction('Update Decentralization Progress', () => {
        this.decentralizationProgress = decentralizationLevel.quantity;
        this.isSophieActivated = isSophieActivated;
        this.isSophiePending = isSophiePending;
        this.sophieActivationTime = sophieActivationTime;
        this.isAurumActivated = isAurumActivated;
        this.isAurumPending = isAurumPending;
        this.aurumActivationTime = aurumActivationTime;
      });

      runInAction('Update Desired Pool Number', () => {
        this.desiredPoolNumber =
          desiredPoolNumber || INITIAL_DESIRED_POOLS_NUMBER;
      });

      runInAction('Update Epoch Config', () => {
        this.slotLength = slotLength.quantity;
        this.epochLength = epochLength.quantity;
      });
    } catch (e) {
      runInAction('Clear Decentralization Progress', () => {
        this.decentralizationProgress = 0;
      });
    }
  };

  openStateDirectory(path: string, event?: MouseEvent): void {
    if (event) event.preventDefault();
    openLocalDirectoryChannel.send(path);
  }

  @action _onCheckDiskSpace = ({
    isNotEnoughDiskSpace,
    diskSpaceRequired,
    diskSpaceMissing,
    diskSpaceRecommended,
    diskSpaceAvailable,
  }: CheckDiskSpaceResponse): Promise<void> => {
    this.isNotEnoughDiskSpace = isNotEnoughDiskSpace;
    this.diskSpaceRequired = diskSpaceRequired;
    this.diskSpaceMissing = diskSpaceMissing;
    this.diskSpaceRecommended = diskSpaceRecommended;
    this.diskSpaceAvailable = diskSpaceAvailable;

    if (this.isNotEnoughDiskSpace) {
      if (this._networkStatusPollingInterval) {
        clearInterval(this._networkStatusPollingInterval);
        this._networkStatusPollingInterval = null;
      }
    } else if (!this._networkStatusPollingInterval) {
      this._setNetworkStatusPollingInterval();
    }

    return Promise.resolve();
  };

  @action _onCheckVerificationProgress = (
    verificationProgress: number
  ): Promise<void> => {
    this.verificationProgress = verificationProgress;
    return Promise.resolve();
  };

  @action _onReceiveStateDirectoryPath = (stateDirectoryPath: string) => {
    this.stateDirectoryPath = stateDirectoryPath;
  };

  @action _toggleSplash = () => {
    runInAction('Toggle splash visibility', () => {
      this.isSplashShown = !this.isSplashShown;
    });
  };

  _resetSystemTime = () => {
    runInAction('Reset system time', () => {
      this.getNetworkClockRequest.reset();
      this.localTimeDifference = null;
      this.isNodeTimeCorrect = true;
      this.isSystemTimeIgnored = false;
    });
  };

  @computed get isConnected(): boolean {
    return this.isNodeResponding && this.isNodeSyncing;
  }

  @computed get isSystemTimeCorrect(): boolean {
    return this.isNodeTimeCorrect || this.isSystemTimeIgnored;
  }

  @computed get isSynced(): boolean {
    return this.isConnected && this.isNodeInSync && this.isSystemTimeCorrect;
  }

  @computed get syncPercentage(): number {
    return this.syncProgress || 0;
  }

  @computed get absoluteSlotNumber(): number {
    const { networkTip } = this;
    return get(networkTip, 'absoluteSlotNumber', 0);
  }

  @computed get isEpochsInfoAvailable(): boolean {
    const { networkTip, nextEpoch } = this;
    return (
      get(nextEpoch, 'epochNumber', null) !== null &&
      get(nextEpoch, 'epochStart', null) !== null &&
      get(networkTip, 'epoch', null) !== null &&
      get(networkTip, 'slot', null) !== null
    );
  }

  @computed get isVerifyingBlockchain(): boolean {
    return !this.isConnected && this.verificationProgress < 100;
  }
}
