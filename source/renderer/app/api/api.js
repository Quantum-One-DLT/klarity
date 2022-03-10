// @flow
import { split, get, map, last, size, concat, flatten } from 'lodash';
import { action } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment';
// domains
import Wallet, {
  WalletDelegationStatuses,
  WalletUnits,
} from '../domains/Wallet';
import {
  WalletTransaction,
  TransactionTypes,
  TransactionStates,
  TransactionWithdrawal,
} from '../domains/WalletTransaction';
import WalletAddress from '../domains/WalletAddress';

// Addresses requests
import { getAddresses } from './addresses/requests/getAddresses';
import { getColeWalletAddresses } from './addresses/requests/getColeWalletAddresses';
import { createColeWalletAddress } from './addresses/requests/createColeWalletAddress';
import { constructAddress } from './addresses/requests/constructAddress';
import { inspectAddress } from './addresses/requests/inspectAddress';

// Network requests
import { getNetworkInfo } from './network/requests/getNetworkInfo';
import { getNetworkClock } from './network/requests/getNetworkClock';
import { getNetworkParameters } from './network/requests/getNetworkParameters';

// Transactions requests
import { getTransactionFee } from './transactions/requests/getTransactionFee';
import { getColeWalletTransactionFee } from './transactions/requests/getColeWalletTransactionFee';
import { getTransaction } from './transactions/requests/getTransaction';
import { getTransactionHistory } from './transactions/requests/getTransactionHistory';
import { getLegacyWalletTransactionHistory } from './transactions/requests/getLegacyWalletTransactionHistory';
import { getWithdrawalHistory } from './transactions/requests/getWithdrawalHistory';
import { createTransaction } from './transactions/requests/createTransaction';
import { createColeWalletTransaction } from './transactions/requests/createColeWalletTransaction';
import { deleteLegacyTransaction } from './transactions/requests/deleteLegacyTransaction';
import { selectCoins } from './transactions/requests/selectCoins';
import { createExternalTransaction } from './transactions/requests/createExternalTransaction';
import { getPublicKey } from './transactions/requests/getPublicKey';
import { getICOPublicKey } from './transactions/requests/getICOPublicKey';

// Voting requests
import { createWalletSignature } from './voting/requests/createWalletSignature';

// Wallets requests
import { updateSpendingPassword } from './wallets/requests/updateSpendingPassword';
import { updateColeSpendingPassword } from './wallets/requests/updateColeSpendingPassword';
import { deleteWallet } from './wallets/requests/deleteWallet';
import { deleteLegacyWallet } from './wallets/requests/deleteLegacyWallet';
import { exportWalletAsJSON } from './wallets/requests/exportWalletAsJSON';
import { importWalletAsJSON } from './wallets/requests/importWalletAsJSON';
import { getWallets } from './wallets/requests/getWallets';
import { getLegacyWallets } from './wallets/requests/getLegacyWallets';
import { importWalletAsKey } from './wallets/requests/importWalletAsKey';
import { createWallet } from './wallets/requests/createWallet';
import { restoreWallet } from './wallets/requests/restoreWallet';
import { restoreLegacyWallet } from './wallets/requests/restoreLegacyWallet';
import { restoreColeWallet } from './wallets/requests/restoreColeWallet';
import { restoreExportedColeWallet } from './wallets/requests/restoreExportedColeWallet';
import { updateWallet } from './wallets/requests/updateWallet';
import { updateColeWallet } from './wallets/requests/updateColeWallet';
import { getWalletUtxos } from './wallets/requests/getWalletUtxos';
import { getColeWalletUtxos } from './wallets/requests/getColeWalletUtxos';
import { getWallet } from './wallets/requests/getWallet';
import { getWalletPublicKey } from './wallets/requests/getWalletPublicKey';
import { getLegacyWallet } from './wallets/requests/getLegacyWallet';
import { transferFundsCalculateFee } from './wallets/requests/transferFundsCalculateFee';
import { transferFunds } from './wallets/requests/transferFunds';
import { createHardwareWallet } from './wallets/requests/createHardwareWallet';
import { getCurrencyList } from './wallets/requests/getCurrencyList';
import { getCurrencyRate } from './wallets/requests/getCurrencyRate';

// Staking
import StakePool from '../domains/StakePool';

// News requests
import { getNews } from './news/requests/getNews';

// Stake Pools request
import { getStakePools } from './staking/requests/getStakePools';
import { getDelegationFee } from './staking/requests/getDelegationFee';
import { joinStakePool } from './staking/requests/joinStakePool';
import { quitStakePool } from './staking/requests/quitStakePool';
import { getSmashSettings } from './staking/requests/getSmashSettings';
import { checkSmashServerHealth } from './staking/requests/checkSmashServerHealth';
import { updateSmashSettings } from './staking/requests/updateSmashSettings';

// Utility functions
import { bccFaultInjectionChannel } from '../ipc/bcc.ipc';
import patchBccApi from './utils/patchBccApi';
import { getLegacyWalletId, utcStringToDate } from './utils';
import { logger } from '../utils/logging';
import {
  unscrambleMnemonics,
  scrambleMnemonics,
  generateAccountMnemonics,
  generateAdditionalMnemonics,
} from './utils/mnemonics';
import { filterLogData } from '../../../common/utils/logging';
import { derivationPathToAddressPath } from '../utils/hardwareWalletUtils';

// Config constants
import { ENTROPICS_PER_BCC } from '../config/numbersConfig';
import {
  SMASH_SERVER_STATUSES,
  SMASH_SERVERS_LIST,
  MIN_REWARDS_REDEMPTION_RECEIVER_BALANCE,
  REWARDS_REDEMPTION_FEE_CALCULATION_AMOUNT,
  DELEGATION_DEPOSIT,
  DELEGATION_ACTIONS,
} from '../config/stakingConfig';
import {
  BCC_CERTIFICATE_MNEMONIC_LENGTH,
  WALLET_RECOVERY_PHRASE_WORD_COUNT,
} from '../config/cryptoConfig';
import { currencyConfig } from '../config/currencyConfig';

// Addresses Types
import type {
  Address,
  GetAddressesRequest,
  CreateColeWalletAddressRequest,
  InspectAddressResponse,
} from './addresses/types';

// Common Types
import type { RequestConfig } from './common/types';

// Network Types
import type {
  GetNetworkInfoResponse,
  NetworkInfoResponse,
  GetNetworkClockResponse,
  NetworkClockResponse,
  GetNetworkParametersResponse,
  GetNetworkParametersApiResponse,
} from './network/types';

// Transactions Types
import type {
  Transaction,
  TransactionFee,
  TransactionWithdrawals,
  GetTransactionFeeRequest,
  GetTransactionFeeResponse,
  CreateTransactionRequest,
  DeleteTransactionRequest,
  GetTransactionRequest,
  GetTransactionsRequest,
  GetTransactionsResponse,
  CoinSelectionsPaymentRequestType,
  CoinSelectionsDelegationRequestType,
  CoinSelectionsResponse,
  CreateExternalTransactionRequest,
  CreateExternalTransactionResponse,
  GetWithdrawalsRequest,
  GetWithdrawalsResponse,
  VotingMetadataType,
  ICOPublicKeyParams,
} from './transactions/types';

// Wallets Types
import type {
  BccWallet,
  BccWallets,
  CreateHardwareWalletRequest,
  LegacyBccWallet,
  LegacyBccWallets,
  WalletUtxos,
  CreateWalletRequest,
  DeleteWalletRequest,
  RestoreWalletRequest,
  RestoreLegacyWalletRequest,
  RestoreExportedColeWalletRequest,
  UpdateSpendingPasswordRequest,
  ExportWalletToFileRequest,
  GetWalletCertificateRecoveryPhraseRequest,
  GetWalletRecoveryPhraseFromCertificateRequest,
  ImportWalletFromKeyRequest,
  ImportWalletFromFileRequest,
  GetWalletUtxosRequest,
  GetWalletRequest,
  GetWalletPublicKeyRequest,
  TransferFundsCalculateFeeRequest,
  TransferFundsCalculateFeeApiResponse,
  TransferFundsCalculateFeeResponse,
  TransferFundsRequest,
  TransferFundsResponse,
  UpdateWalletRequest,
  GetCurrencyListResponse,
  GetCurrencyRateRequest,
  GetCurrencyRateResponse,
  GetAccountPublicKeyRequest,
} from './wallets/types';
import type { WalletProps } from '../domains/Wallet';

// News Types
import type { GetNewsResponse } from './news/types';

// Staking Types
import type {
  JoinStakePoolRequest,
  GetDelegationFeeRequest,
  DelegationCalculateFeeResponse,
  BccApiStakePools,
  BccApiStakePool,
  QuitStakePoolRequest,
  GetRedeemItnRewardsFeeRequest,
  GetRedeemItnRewardsFeeResponse,
  RequestRedeemItnRewardsRequest,
  RequestRedeemItnRewardsResponse,
  GetSmashSettingsApiResponse,
  CheckSmashServerHealthApiResponse,
  PoolMetadataSource,
} from './staking/types';

// Voting Types
import type {
  CreateVotingRegistrationRequest,
  CreateWalletSignatureRequest,
} from './voting/types';

import type { StakePoolProps } from '../domains/StakePool';
import type { FaultInjectionIpcRequest } from '../../../common/types/bcc-node.types';

import { TlsCertificateNotValidError } from './nodes/errors';
import { getSHA256HexForString } from './utils/hashing';
import { getNewsHash } from './news/requests/getNewsHash';
import { deleteTransaction } from './transactions/requests/deleteTransaction';
import { WALLET_COLE_KINDS } from '../config/walletRestoreConfig';
import ApiError from '../domains/ApiError';
import { formattedAmountToEntropic } from '../utils/formatters';
import type {
  GetAssetsRequest,
  GetAssetsResponse,
  ApiAsset,
  StoredAssetMetadata,
} from './assets/types';
import type { AssetLocalData } from './utils/localStorage';
import Asset from '../domains/Asset';
import { getAssets } from './assets/requests/getAssets';
import { getAccountPublicKey } from './wallets/requests/getAccountPublicKey';

export default class BccApi {
  config: RequestConfig;

  // We need to preserve all asset metadata during single runtime in order
  // to avoid losing it in case of Token Metadata Registry server unvailability
  storedAssetMetadata: StoredAssetMetadata = {};

  constructor(isTest: boolean, config: RequestConfig) {
    this.setRequestConfig(config);
    if (isTest) patchBccApi(this);
  }

  setRequestConfig(config: RequestConfig) {
    this.config = config;
  }

  getWallets = async (): Promise<Array<Wallet>> => {
    logger.debug('BccApi::getWallets called');
    const {
      getHardwareWalletLocalData,
      getHardwareWalletsLocalData,
    } = global.klarity.api.localStorage;
    try {
      const wallets: BccWallets = await getWallets(this.config);
      const legacyWallets: LegacyBccWallets = await getLegacyWallets(
        this.config
      );
      const hwLocalData = await getHardwareWalletsLocalData();
      logger.debug('BccApi::getWallets success', {
        wallets,
        legacyWallets,
        hwLocalData: filterLogData(hwLocalData),
      });
      map(legacyWallets, (legacyBccWallet) => {
        const extraLegacyWalletProps = {
          address_pool_gap: 0, // Not needed for legacy wallets
          delegation: {
            active: {
              status: WalletDelegationStatuses.NOT_DELEGATING,
            },
          },
          isLegacy: true,
        };
        wallets.push({
          ...legacyBccWallet,
          ...extraLegacyWalletProps,
        });
      });

      // @TODO - Remove this once we get hardware wallet flag from WBE
      return await Promise.all(
        wallets.map(async (wallet) => {
          const { id } = wallet;
          const walletData = await getHardwareWalletLocalData(id);
          return _createWalletFromServerData({
            ...wallet,
            isHardwareWallet:
              walletData && walletData.device && size(walletData.device) > 0,
          });
        })
      );
    } catch (error) {
      logger.error('BccApi::getWallets error', { error });
      throw new ApiError(error);
    }
  };

  getWallet = async (request: GetWalletRequest): Promise<Wallet> => {
    logger.debug('BccApi::getWallet called', {
      parameters: filterLogData(request),
    });
    try {
      const { walletId, isLegacy } = request;
      let wallet;
      if (isLegacy) {
        const legacyWallet: LegacyBccWallet = await getLegacyWallet(
          this.config,
          { walletId }
        );
        const extraLegacyWalletProps = {
          address_pool_gap: 0, // Not needed for legacy wallets
          delegation: {
            active: {
              status: WalletDelegationStatuses.NOT_DELEGATING,
            },
          },
          isLegacy: true,
        };
        wallet = {
          ...legacyWallet,
          ...extraLegacyWalletProps,
        };
      } else {
        wallet = await getWallet(this.config, { walletId });
      }
      logger.debug('BccApi::getWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::getWallet error', { error });
      throw new ApiError(error);
    }
  };

  getWalletPublicKey = async (
    request: GetWalletPublicKeyRequest
  ): Promise<string> => {
    logger.debug('BccApi::getWalletPublicKey called', {
      parameters: filterLogData(request),
    });
    try {
      const { walletId, role, index } = request;
      const walletPublicKey: string = await getWalletPublicKey(this.config, {
        walletId,
        role,
        index,
      });
      logger.debug('BccApi::getWalletPublicKey success', { walletPublicKey });
      return walletPublicKey;
    } catch (error) {
      logger.error('BccApi::getWalletPublicKey error', { error });
      throw new ApiError(error);
    }
  };

  getAccountPublicKey = async (
    request: GetAccountPublicKeyRequest
  ): Promise<string> => {
    logger.debug('BccApi::getAccountPublicKey called', {
      parameters: filterLogData(request),
    });
    try {
      const { walletId, index, passphrase, extended } = request;
      const accountPublicKey: string = await getAccountPublicKey(this.config, {
        walletId,
        index,
        passphrase,
        extended,
      });
      logger.debug('BccApi::getAccountPublicKey success', { accountPublicKey });
      return accountPublicKey;
    } catch (error) {
      logger.error('BccApi::getAccountPublicKey error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  getAddresses = async (
    request: GetAddressesRequest
  ): Promise<Array<WalletAddress>> => {
    logger.debug('BccApi::getAddresses called', {
      parameters: filterLogData(request),
    });
    const { walletId, queryParams, isLegacy } = request;

    try {
      let response = [];
      if (isLegacy) {
        response = await getColeWalletAddresses(
          this.config,
          walletId,
          queryParams
        );
      } else {
        response = await getAddresses(this.config, walletId, queryParams);
        response.reverse();
      }
      logger.debug('BccApi::getAddresses success', { addresses: response });
      return response.map(_createAddressFromServerData);
    } catch (error) {
      logger.error('BccApi::getAddresses error', { error });
      throw new ApiError(error);
    }
  };

  getTransaction = async (
    request: GetTransactionRequest
  ): Promise<WalletTransaction> => {
    logger.debug('BccApi::getTransaction called', { parameters: request });
    const { walletId, transactionId } = request;

    try {
      const response = await getTransaction(
        this.config,
        walletId,
        transactionId
      );
      logger.debug('BccApi::getTransaction success', { response });
      return _createTransactionFromServerData(response);
    } catch (error) {
      logger.error('BccApi::getTransaction error', { error });
      throw new ApiError(error);
    }
  };

  getTransactions = async (
    request: GetTransactionsRequest
  ): Promise<GetTransactionsResponse> => {
    logger.debug('BccApi::getTransactions called', { parameters: request });
    const { walletId, order, fromDate, toDate, isLegacy } = request;

    const params = Object.assign(
      {},
      {
        order: order || 'descending',
      }
    );
    if (fromDate)
      params.start = `${moment.utc(fromDate).format('YYYY-MM-DDTHH:mm:ss')}Z`;
    if (toDate)
      params.end = `${moment.utc(toDate).format('YYYY-MM-DDTHH:mm:ss')}Z`;

    try {
      let response;
      if (isLegacy) {
        response = await getLegacyWalletTransactionHistory(
          this.config,
          walletId,
          params
        );
      } else {
        response = await getTransactionHistory(this.config, walletId, params);
      }

      logger.debug('BccApi::getTransactions success', {
        transactions: response,
      });
      const transactions = response.map((tx) =>
        _createTransactionFromServerData(tx)
      );
      return Promise.resolve({ transactions, total: response.length });
    } catch (error) {
      logger.error('BccApi::getTransactions error', { error });
      throw new ApiError(error);
    }

    // @API TODO - Filter / Search fine tuning "pending" for V2

    // const requestStats = Object.assign({}, request, {
    //   cachedTransactions: request.cachedTransactions.length,
    // });
    //  logger.debug('BccApi::searchHistory called', { parameters: requestStats });
    // const requestTimestamp = moment();
    // const params = {
    //   wallet_id: walletId,
    //   page: skip === 0 ? 1 : skip + 1,
    //   per_page: perPage,
    //   sort_by: 'DES[created_at]',
    //   created_at: `LTE[${moment.utc().format('YYYY-MM-DDTHH:mm:ss')}]`,
    //   // ^^ By setting created_at filter to current time we make sure
    //   // all subsequent multi-pages requests load the same set of transactions
    // };
    //
    //
    // const {
    //   walletId,
    //   skip,
    //   limit,
    //   isFirstLoad, // during first load we fetch all wallet's transactions
    //   isRestoreActive, // during restoration we fetch only missing transactions
    //   isRestoreCompleted, // once restoration is done we fetch potentially missing transactions
    //   cachedTransactions,
    // } , unionBy= request;
    //
    //
    // let perPage = limit;
    // const shouldLoadAll = limit === null;
    // if (shouldLoadAll || limit > MAX_TRANSACTIONS_PER_PAGE) {
    //   perPage = MAX_TRANSACTIONS_PER_PAGE;
    // }
    //
    // const params = {
    //   wallet_id: walletId,
    //   page: skip === 0 ? 1 : skip + 1,
    //   per_page: perPage,
    //   sort_by: 'DES[created_at]',
    //   created_at: `LTE[${moment.utc().format('YYYY-MM-DDTHH:mm:ss')}]`,
    //   // ^^ By setting created_at filter to current time we make sure
    //   // all subsequent multi-pages requests load the same set of transactions
    // };
    //
    // const shouldLoadOnlyFresh =
    //   !isFirstLoad && !isRestoreActive && !isRestoreCompleted;
    // if (shouldLoadOnlyFresh) {
    //   const tenMinutesAgo = moment
    //     .utc(Date.now() - TX_AGE_POLLING_THRESHOLD)
    //     .format('YYYY-MM-DDTHH:mm:ss');
    //   // Since we load all transactions in a first load, later on we only care about fresh ones
    //   Object.assign(params, { created_at: `GTE[${tenMinutesAgo}]` });
    // }
    //
    // const pagesToBeLoaded = Math.ceil(limit / params.per_page);
    //
    // try {
    //   // Load first page of transactions
    //   const response: Transactions = await getTransactionHistory(
    //     this.config,
    //     params
    //   );
    //   const { meta, data: txHistory } = response;
    //   const { totalPages, totalEntries: totalTransactions } = meta.pagination;
    //
    //   let transactions = txHistory.map(tx =>
    //     _createTransactionFromServerData(tx)
    //   );
    //
    //   // Load additional pages of transactions
    //   const hasMultiplePages =
    //     totalPages > 1 && (shouldLoadAll || limit > perPage);
    //   if (hasMultiplePages) {
    //     let page = 2;
    //     const hasNextPage = () => {
    //       const hasMorePages = page < totalPages + 1;
    //       if ((isRestoreActive || isRestoreCompleted) && hasMorePages) {
    //         const loadedTransactions = unionBy(
    //           transactions,
    //           cachedTransactions,
    //           'id'
    //         );
    //         const hasMoreTransactions =
    //           totalTransactions - loadedTransactions.length > 0;
    //         return hasMoreTransactions;
    //       }
    //       return hasMorePages;
    //     };
    //     const shouldLoadNextPage = () =>
    //       shouldLoadAll || page <= pagesToBeLoaded;
    //
    //     if (isRestoreActive || isRestoreCompleted) {
    //       const latestLoadedTransactionDate = transactions[0].date;
    //       const latestLoadedTransactionDateString = moment
    //         .utc(latestLoadedTransactionDate)
    //         .format('YYYY-MM-DDTHH:mm:ss');
    //       // During restoration we need to fetch only transactions older than the latest loaded one
    //       // as this ensures that both totalPages and totalEntries remain unchanged throughout
    //       // subsequent page loads (as in the meantime new transactions can be discovered)
    //       Object.assign(params, {
    //         created_at: `LTE[${latestLoadedTransactionDateString}]`,
    //       });
    //     }
    //
    //     for (page; hasNextPage() && shouldLoadNextPage(); page++) {
    //       const { data: pageHistory } = await getTransactionHistory(
    //         this.config,
    //         Object.assign(params, { page })
    //       );
    //       transactions.push(
    //         ...pageHistory.map(tx => _createTransactionFromServerData(tx))
    //       );
    //     }
    //   }
    //
    //   // Merge newly loaded and previously loaded transactions
    //   // - unionBy also serves the purpose of removing transaction duplicates
    //   //   which may occur as a side-effect of transaction request pagination
    //   //   as multi-page requests are not executed at the exact same time!
    //   transactions = unionBy(transactions, cachedTransactions, 'id');
    //
    //   // Enforce the limit in case we are not loading all transactions
    //   if (!shouldLoadAll) transactions.splice(limit);
    //
    //   const total = transactions.length;
    //
    //   const responseStats = {
    //     apiRequested: limit || 'all',
    //     apiFiltered: shouldLoadOnlyFresh ? 'fresh' : '',
    //     apiReturned: totalTransactions,
    //     apiPagesTotal: totalPages,
    //     apiPagesRequested: params.page,
    //     klarityCached: cachedTransactions.length,
    //     klarityLoaded: total - cachedTransactions.length,
    //     klarityTotal: total,
    //     requestDurationInMs: moment
    //       .duration(moment().diff(requestTimestamp))
    //       .as('milliseconds'),
    //   };
    //   logger.debug(
    //     `BccApi::searchHistory success: ${total} transactions loaded`,
    //     { responseStats }
    //   );
    //   return new Promise(resolve => resolve({ transactions, total }));
    // } catch (error) {
    //   logger.error('BccApi::searchHistory error', { error });
    //   throw new GenericApiError(error);
    // }
  };

  getAssets = async (request: GetAssetsRequest): Promise<GetAssetsResponse> => {
    logger.debug('BccApi::getAssets called', { parameters: request });
    const { walletId } = request;
    try {
      const response = await getAssets(this.config, { walletId });
      logger.debug('BccApi::getAssets success', {
        assets: response,
      });
      const assetsLocaldata = await global.klarity.api.localStorage.getAssetsLocalData();
      logger.debug('BccApi::getAssetsLocalData success', {
        assetsLocaldata,
      });
      const assets = response.map((asset) =>
        _createAssetFromServerData(
          asset,
          assetsLocaldata[asset.policy_id + asset.asset_name] || {},
          this.storedAssetMetadata
        )
      );
      return new Promise((resolve) =>
        resolve({ assets, total: response.length })
      );
    } catch (error) {
      logger.error('BccApi::getAssets error', { error });
      throw new ApiError(error);
    }
  };

  getWithdrawals = async (
    request: GetWithdrawalsRequest
  ): Promise<GetWithdrawalsResponse> => {
    logger.debug('BccApi::getWithdrawals called', { parameters: request });
    const { walletId } = request;
    try {
      const response = await getWithdrawalHistory(this.config, walletId);
      logger.debug('BccApi::getWithdrawals success', {
        transactions: response,
      });
      let withdrawals = new BigNumber(0);
      const outgoingTransactions = response.filter(
        (tx: Transaction) =>
          tx.direction === 'outgoing' && tx.status === 'in_ledger'
      );
      outgoingTransactions.forEach((tx: Transaction) => {
        tx.withdrawals.forEach((w: TransactionWithdrawals) => {
          const withdrawal = new BigNumber(
            w.amount.quantity.toString()
          ).dividedBy(ENTROPICS_PER_BCC);
          withdrawals = withdrawals.plus(withdrawal);
        });
      });
      return { withdrawals };
    } catch (error) {
      logger.error('BccApi::getWithdrawals error', { error });
      throw new ApiError(error);
    }
  };

  createWallet = async (request: CreateWalletRequest): Promise<Wallet> => {
    logger.debug('BccApi::createWallet called', {
      parameters: filterLogData(request),
    });
    const { name, mnemonic, spendingPassword } = request;
    try {
      const walletInitData = {
        name,
        mnemonic_sentence: split(mnemonic, ' '),
        passphrase: spendingPassword,
      };
      const wallet: BccWallet = await createWallet(this.config, {
        walletInitData,
      });
      logger.debug('BccApi::createWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::createWallet error', { error });
      throw new ApiError(error);
    }
  };

  createLegacyWallet = async (
    request: CreateWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::createLegacyWallet called', {
      parameters: filterLogData(request),
    });
    const { name, mnemonic, spendingPassword } = request;
    try {
      const walletInitData = {
        name,
        mnemonic_sentence: split(mnemonic, ' '),
        passphrase: spendingPassword,
      };
      const legacyWallet: LegacyBccWallet = await restoreColeWallet(
        this.config,
        { walletInitData },
        'random'
      );
      // Generate address for the newly created Cole wallet
      const { id: walletId } = legacyWallet;
      const address: Address = await createColeWalletAddress(this.config, {
        passphrase: spendingPassword,
        walletId,
      });
      logger.debug('BccApi::createColeWalletAddress success', { address });
      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
        assets: {
          available: [],
          total: [],
        },
      };
      const wallet: BccWallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::createLegacyWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::createLegacyWallet error', { error });
      throw new ApiError(error);
    }
  };

  deleteWallet = async (request: DeleteWalletRequest): Promise<boolean> => {
    logger.debug('BccApi::deleteWallet called', {
      parameters: filterLogData(request),
    });
    try {
      const { walletId, isLegacy } = request;
      let response;
      if (isLegacy) {
        response = await deleteLegacyWallet(this.config, { walletId });
      } else {
        response = await deleteWallet(this.config, { walletId });
      }
      logger.debug('BccApi::deleteWallet success', { response });
      return true;
    } catch (error) {
      logger.error('BccApi::deleteWallet error', { error });
      throw new ApiError(error);
    }
  };

  createTransaction = async (
    request: CreateTransactionRequest
  ): Promise<WalletTransaction> => {
    logger.debug('BccApi::createTransaction called', {
      parameters: filterLogData(request),
    });
    const {
      walletId,
      address,
      amount,
      passphrase,
      isLegacy,
      assets,
      withdrawal = TransactionWithdrawal,
    } = request;

    try {
      const data = {
        payments: [
          {
            address,
            amount: {
              quantity: amount,
              unit: WalletUnits.ENTROPIC,
            },
            assets,
          },
        ],
        passphrase,
      };

      let response: Transaction;
      if (isLegacy) {
        response = await createColeWalletTransaction(this.config, {
          walletId,
          data,
        });
      } else {
        response = await createTransaction(this.config, {
          walletId,
          data: { ...data, withdrawal },
        });
      }

      logger.debug('BccApi::createTransaction success', {
        transaction: response,
      });

      return _createTransactionFromServerData(response);
    } catch (error) {
      logger.error('BccApi::createTransaction error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .set('transactionIsTooBig', true, {
          linkLabel: 'tooBigTransactionErrorLinkLabel',
          linkURL: 'tooBigTransactionErrorLinkURL',
        })
        .where('code', 'transaction_is_too_big')
        .result();
    }
  };

  // For testing purpose ONLY
  createExpiredTransaction = async (request: any): Promise<*> => {
    if (global.environment.isDev) {
      logger.debug('BccApi::createTransaction called', {
        parameters: filterLogData(request),
      });
      const {
        walletId,
        address,
        amount,
        passphrase,
        isLegacy,
        withdrawal = TransactionWithdrawal,
        ttl,
      } = request;
      try {
        const data = {
          payments: [
            {
              address,
              amount: {
                quantity: amount,
                unit: WalletUnits.ENTROPIC,
              },
            },
          ],
          passphrase,
          time_to_live: {
            quantity: ttl,
            unit: 'second',
          },
        };

        let response: Transaction;
        if (isLegacy) {
          response = await createColeWalletTransaction(this.config, {
            walletId,
            data,
          });
        } else {
          response = await createTransaction(this.config, {
            walletId,
            data: { ...data, withdrawal },
          });
        }

        logger.debug('BccApi::createTransaction success', {
          transaction: response,
        });

        return _createTransactionFromServerData(response);
      } catch (error) {
        logger.error('BccApi::createTransaction error', { error });
        throw new ApiError(error)
          .set('wrongEncryptionPassphrase')
          .where('code', 'bad_request')
          .inc('message', 'passphrase is too short')
          .set('transactionIsTooBig', true, {
            linkLabel: 'tooBigTransactionErrorLinkLabel',
            linkURL: 'tooBigTransactionErrorLinkURL',
          })
          .where('code', 'transaction_is_too_big')
          .result();
      }
    }
    return null;
  };

  calculateTransactionFee = async (
    request: GetTransactionFeeRequest
  ): Promise<GetTransactionFeeResponse> => {
    logger.debug('BccApi::calculateTransactionFee called', {
      parameters: filterLogData(request),
    });
    const {
      walletId,
      address,
      amount,
      assets,
      walletBalance,
      availableBalance,
      rewardsBalance,
      isLegacy,
      withdrawal = TransactionWithdrawal,
    } = request;

    try {
      const data = {
        payments: [
          {
            address,
            amount: {
              quantity: amount,
              unit: WalletUnits.ENTROPIC,
            },
            assets,
          },
        ],
      };

      let response: TransactionFee;
      if (isLegacy) {
        response = await getColeWalletTransactionFee(this.config, {
          walletId,
          data,
        });
      } else {
        response = await getTransactionFee(this.config, {
          walletId,
          data: { ...data, withdrawal },
        });
      }

      const formattedTxAmount = new BigNumber(amount.toString()).dividedBy(
        ENTROPICS_PER_BCC
      );
      const { fee, minimumBcc } = _createTransactionFeeFromServerData(response);
      const amountWithFee = formattedTxAmount.plus(fee);
      const isRewardsRedemptionRequest = Array.isArray(withdrawal);
      if (!isRewardsRedemptionRequest && amountWithFee.gt(walletBalance)) {
        // Amount + fees exceeds walletBalance:
        // = show "Not enough Bcc for fees. Try sending a smaller amount."
        throw new ApiError().result('cannotCoverFee');
      }
      logger.debug('BccApi::calculateTransactionFee success', {
        transactionFee: response,
      });
      return { fee, minimumBcc };
    } catch (error) {
      let notEnoughMoneyError;
      if (walletBalance.gt(availableBalance)) {
        // 1. Amount exceeds availableBalance due to pending transactions:
        // - walletBalance > availableBalance
        // = show "Cannot calculate fees while there are pending transactions."
        notEnoughMoneyError = 'canNotCalculateTransactionFees';
      } else if (
        !walletBalance.isZero() &&
        walletBalance.isEqualTo(rewardsBalance)
      ) {
        // 2. Wallet contains only rewards:
        // - walletBalance === rewardsBalance
        // = show "Cannot send from a wallet that contains only rewards balances."
        notEnoughMoneyError = 'inputsDepleted';
      } else {
        // 3. Amount exceeds walletBalance:
        // - walletBalance === availableBalance
        // = show "Not enough Bcc. Try sending a smaller amount."
        notEnoughMoneyError = 'notEnoughFundsForTransaction';
      }

      // ApiError with logging showcase
      throw new ApiError(error, {
        logError: true,
        msg: 'BccApi::calculateTransactionFee error',
      })
        .set(notEnoughMoneyError, true)
        .where('code', 'not_enough_money')
        .set('utxoTooSmall', true, {
          minimumBcc: get(
            /(Expected min coin value: +)([0-9]+.[0-9]+)/.exec(error.message),
            2,
            0
          ),
        })
        .where('code', 'utxo_too_small')
        .set('invalidAddress')
        .where('code', 'bad_request')
        .inc('message', 'Unable to decode Address')
        .result();
    }
  };

  selectCoins = async (request: {
    walletId: string,
    walletBalance: BigNumber,
    availableBalance: BigNumber,
    rewardsBalance: BigNumber,
    payments?: CoinSelectionsPaymentRequestType,
    delegation?: CoinSelectionsDelegationRequestType,
    metadata?: VotingMetadataType,
  }): Promise<CoinSelectionsResponse> => {
    logger.debug('BccApi::selectCoins called', {
      parameters: filterLogData(request),
    });
    const {
      walletId,
      payments,
      delegation,
      walletBalance,
      availableBalance,
      rewardsBalance,
      metadata,
    } = request;
    try {
      let data;
      if (delegation) {
        data = {
          delegation_action: {
            action: delegation.delegationAction,
            pool: delegation.poolId,
          },
        };
      } else if (payments) {
        data = {
          payments: [
            {
              address: payments.address,
              amount: {
                quantity: payments.amount,
                unit: WalletUnits.ENTROPIC,
              },
              assets: payments.assets,
            },
          ],
          withdrawal: TransactionWithdrawal,
          metadata: metadata || null,
        };
      } else {
        throw new Error('Missing parameters!');
      }
      const response = await selectCoins(this.config, {
        walletId,
        data,
      });

      // @TODO - handle CHANGE paramete on smarter way and change corresponding downstream logic
      const outputs = concat(response.outputs, response.change);

      // Calculate fee from inputs and outputs
      const inputsData = [];
      const outputsData = [];
      const certificatesData = [];
      let totalInputs = new BigNumber(0);
      let totalOutputs = new BigNumber(0);

      map(response.inputs, (input) => {
        const inputAmount = new BigNumber(input.amount.quantity.toString());
        const inputAssets = map(input.assets, (asset) => ({
          policyId: asset.policy_id,
          assetName: asset.asset_name,
          quantity: asset.quantity,
        }));
        totalInputs = totalInputs.plus(inputAmount);
        const inputData = {
          address: input.address,
          amount: input.amount,
          id: input.id,
          index: input.index,
          derivationPath: input.derivation_path,
          assets: inputAssets,
        };
        inputsData.push(inputData);
      });

      map(outputs, (output) => {
        const outputAmount = new BigNumber(output.amount.quantity.toString());
        const outputAssets = map(output.assets, (asset) => ({
          policyId: asset.policy_id,
          assetName: asset.asset_name,
          quantity: asset.quantity,
        }));
        totalOutputs = totalOutputs.plus(outputAmount);
        const outputData = {
          address: output.address,
          amount: output.amount,
          derivationPath: output.derivation_path || null,
          assets: outputAssets,
        };
        outputsData.push(outputData);
      });

      if (response.certificates) {
        map(response.certificates, (certificate) => {
          const certificateData = {
            certificateType: certificate.certificate_type,
            rewardAccountPath: certificate.reward_account_path,
            pool: certificate.pool || null,
          };
          certificatesData.push(certificateData);
        });
      }

      const withdrawalsData = map(response.withdrawals, (withdrawal) => ({
        stakeAddress: withdrawal.stake_address,
        derivationPath: withdrawal.derivation_path,
        amount: withdrawal.amount,
      }));

      const depositsArray = map(response.deposits, (deposit) =>
        deposit.quantity.toString()
      );
      const deposits = depositsArray.length
        ? BigNumber.sum.apply(null, depositsArray)
        : new BigNumber(0);
      // @TODO - Use api response when api is ready
      const depositsReclaimed =
        delegation && delegation.delegationAction === DELEGATION_ACTIONS.QUIT
          ? new BigNumber(DELEGATION_DEPOSIT).multipliedBy(ENTROPICS_PER_BCC)
          : new BigNumber(0);

      const withdrawalsArray = map(response.withdrawals, (withdrawal) =>
        withdrawal.amount.quantity.toString()
      );
      const withdrawals = withdrawalsArray.length
        ? BigNumber.sum.apply(null, withdrawalsArray)
        : new BigNumber(0);

      if (withdrawals) {
        totalOutputs = totalOutputs.minus(withdrawals);
      }

      const fee =
        delegation && delegation.delegationAction === DELEGATION_ACTIONS.QUIT
          ? totalInputs.minus(totalOutputs).plus(depositsReclaimed)
          : totalInputs.minus(totalOutputs).minus(deposits);

      const extendedResponse = {
        inputs: inputsData,
        outputs: outputsData,
        certificates: certificatesData,
        withdrawals: withdrawals.gt(0) ? withdrawalsData : [],
        fee: fee.dividedBy(ENTROPICS_PER_BCC),
        deposits: deposits.dividedBy(ENTROPICS_PER_BCC),
        depositsReclaimed: depositsReclaimed.dividedBy(ENTROPICS_PER_BCC),
        metadata: response.metadata || null,
      };

      logger.debug('BccApi::selectCoins success', { extendedResponse });
      return extendedResponse;
    } catch (error) {
      logger.error('BccApi::selectCoins error', { error });

      let notEnoughMoneyError;
      if (walletBalance.gt(availableBalance)) {
        // 1. Amount exceeds availableBalance due to pending transactions:
        // - walletBalance > availableBalance
        // = show "Cannot calculate fees while there are pending transactions."
        notEnoughMoneyError = 'canNotCalculateTransactionFees';
      } else if (
        !walletBalance.isZero() &&
        walletBalance.isEqualTo(rewardsBalance)
      ) {
        // 2. Wallet contains only rewards:
        // - walletBalance === rewardsBalance
        // = show "Cannot send from a wallet that contains only rewards balances."
        notEnoughMoneyError = 'inputsDepleted';
      } else {
        // 3. Amount exceeds walletBalance:
        // - walletBalance === availableBalance
        // = show "Not enough Bcc. Try sending a smaller amount."
        notEnoughMoneyError = 'notEnoughFundsForTransaction';
      }

      // ApiError with logging showcase
      throw new ApiError(error, {
        logError: true,
        msg: 'BccApi::calculateTransactionFee error',
      })
        .set(notEnoughMoneyError, true)
        .where('code', 'not_enough_money')
        .set('utxoTooSmall', true, {
          minimumBcc: get(
            /(Expected min coin value: +)([0-9]+.[0-9]+)/.exec(error.message),
            2,
            0
          ),
        })
        .where('code', 'utxo_too_small')
        .set('invalidAddress')
        .where('code', 'bad_request')
        .inc('message', 'Unable to decode Address')
        .result();
    }
  };

  createExternalTransaction = async (
    request: CreateExternalTransactionRequest
  ): Promise<CreateExternalTransactionResponse> => {
    const { signedTransactionBlob } = request;
    try {
      const response = await createExternalTransaction(this.config, {
        signedTransactionBlob,
      });
      return response;
    } catch (error) {
      logger.error('BccApi::createExternalTransaction error', { error });
      throw new ApiError(error);
    }
  };

  inspectAddress = async (request: {
    addressId: string,
  }): Promise<InspectAddressResponse> => {
    logger.debug('BccApi::inspectAddress called', {
      parameters: filterLogData(request),
    });
    const { addressId } = request;
    try {
      const response = await inspectAddress(this.config, {
        addressId,
      });
      logger.debug('BccApi::inspectAddress success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::inspectAddress error', { error });
      throw new ApiError(error);
    }
  };

  getPublicKey = async (
    request: any // @TODO
  ): Promise<any> => {
    logger.debug('BccApi::getPublicKey called', {
      parameters: filterLogData(request),
    });
    const { walletId, role, index } = request;
    try {
      const response = await getPublicKey(this.config, {
        walletId,
        role,
        index,
      });
      logger.debug('BccApi::getPublicKey success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::getPublicKey error', { error });
      throw new ApiError(error);
    }
  };

  getICOPublicKey = async (request: ICOPublicKeyParams): Promise<string> => {
    logger.debug('BccApi::getICOPublicKey called', {
      parameters: filterLogData(request),
    });
    try {
      const response = await getICOPublicKey(this.config, request);
      logger.debug('BccApi::getICOPublicKey success', {
        icoPublicKey: response,
      });
      return response;
    } catch (error) {
      logger.error('BccApi::getICOPublicKey error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  constructAddress = async (
    request: any // @TODO
  ): Promise<any> => {
    const { data } = request;
    try {
      const response = await constructAddress(this.config, {
        data,
      });
      logger.debug('BccApi::constructAddress success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::constructAddress error', { error });
      throw new ApiError(error);
    }
  };

  createAddress = async (
    request: CreateColeWalletAddressRequest
  ): Promise<WalletAddress> => {
    logger.debug('BccApi::createAddress called', {
      parameters: filterLogData(request),
    });
    const { addressIndex, walletId, passphrase: passwordString } = request;
    const passphrase = passwordString || '';
    try {
      const address: Address = await createColeWalletAddress(this.config, {
        passphrase,
        walletId,
        addressIndex,
      });
      logger.debug('BccApi::createAddress success', { address });
      return _createAddressFromServerData(address);
    } catch (error) {
      logger.error('BccApi::createAddress error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  deleteTransaction = async (
    request: DeleteTransactionRequest
  ): Promise<void> => {
    logger.debug('BccApi::deleteTransaction called', { parameters: request });
    const { walletId, transactionId, isLegacy } = request;
    try {
      let response;
      if (isLegacy) {
        response = await deleteLegacyTransaction(this.config, {
          walletId,
          transactionId,
        });
      } else {
        response = await deleteTransaction(this.config, {
          walletId,
          transactionId,
        });
      }
      logger.debug('BccApi::deleteTransaction success', response);
    } catch (error) {
      logger.error('BccApi::deleteTransaction error', { error });
      // In this particular call we don't need to handle the error in the UI
      // The only reason transaction canceling would fail is if the transaction
      // is no longer pending - in which case there is nothing we can do.
    }
  };

  isValidCertificateMnemonic = (mnemonic: string): boolean =>
    mnemonic.split(' ').length === BCC_CERTIFICATE_MNEMONIC_LENGTH;

  getWalletRecoveryPhrase(): Promise<Array<string>> {
    logger.debug('BccApi::getWalletRecoveryPhrase called');
    try {
      const response: Promise<Array<string>> = new Promise((resolve) =>
        resolve(generateAccountMnemonics(WALLET_RECOVERY_PHRASE_WORD_COUNT))
      );
      logger.debug('BccApi::getWalletRecoveryPhrase success');
      return response;
    } catch (error) {
      logger.error('BccApi::getWalletRecoveryPhrase error', { error });
      throw new ApiError(error);
    }
  }

  getWalletCertificateAdditionalMnemonics(): Promise<Array<string>> {
    logger.debug('BccApi::getWalletCertificateAdditionalMnemonics called');
    try {
      const response: Promise<Array<string>> = new Promise((resolve) =>
        resolve(generateAdditionalMnemonics())
      );
      logger.debug('BccApi::getWalletCertificateAdditionalMnemonics success');
      return response;
    } catch (error) {
      logger.error('BccApi::getWalletCertificateAdditionalMnemonics error', {
        error,
      });
      throw new ApiError(error);
    }
  }

  getWalletCertificateRecoveryPhrase(
    request: GetWalletCertificateRecoveryPhraseRequest
  ): Promise<Array<string>> {
    logger.debug('BccApi::getWalletCertificateRecoveryPhrase called');
    const { passphrase, input: scrambledInput } = request;
    try {
      const response: Promise<Array<string>> = new Promise((resolve) =>
        resolve(scrambleMnemonics({ passphrase, scrambledInput }))
      );
      logger.debug('BccApi::getWalletCertificateRecoveryPhrase success');
      return response;
    } catch (error) {
      logger.error('BccApi::getWalletCertificateRecoveryPhrase error', {
        error,
      });
      throw new ApiError(error);
    }
  }

  getWalletRecoveryPhraseFromCertificate(
    request: GetWalletRecoveryPhraseFromCertificateRequest
  ): Promise<Array<string>> {
    logger.debug('BccApi::getWalletRecoveryPhraseFromCertificate called');
    const { passphrase, scrambledInput } = request;
    try {
      const response = unscrambleMnemonics({ passphrase, scrambledInput });
      logger.debug('BccApi::getWalletRecoveryPhraseFromCertificate success');
      return Promise.resolve(response);
    } catch (error) {
      logger.error('BccApi::getWalletRecoveryPhraseFromCertificate error', {
        error,
      });
      const errorRejection = new ApiError(error)
        .set('invalidMnemonic', true)
        .result();
      return Promise.reject(errorRejection);
    }
  }

  restoreWallet = async (request: RestoreWalletRequest): Promise<Wallet> => {
    logger.debug('BccApi::restoreWallet called', {
      parameters: filterLogData(request),
    });
    const { recoveryPhrase, walletName, spendingPassword } = request;
    const walletInitData = {
      name: walletName,
      mnemonic_sentence: recoveryPhrase,
      passphrase: spendingPassword,
    };
    try {
      const wallet: BccWallet = await restoreWallet(this.config, {
        walletInitData,
      });
      logger.debug('BccApi::restoreWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreWallet error', { error });
      throw new ApiError(error)
        .set('forbiddenMnemonic')
        .where('message', 'JSONValidationFailed')
        .inc(
          'diagnostic.validationError',
          'Forbidden Mnemonic: an example Mnemonic has been submitted'
        )
        .set('forbiddenMnemonic')
        .where('code', 'invalid_restoration_parameters')
        .result();
    }
  };

  createHardwareWallet = async (
    request: CreateHardwareWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::createHardwareWallet called', {
      parameters: filterLogData(request),
    });
    const { walletName, accountPublicKey } = request;
    const walletInitData = {
      name: walletName,
      account_public_key: accountPublicKey,
    };

    try {
      const hardwareWallet: BccWallet = await createHardwareWallet(
        this.config,
        {
          walletInitData,
        }
      );
      const wallet = {
        ...hardwareWallet,
        isHardwareWallet: true,
      };
      logger.debug('BccApi::createHardwareWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::createHardwareWallet error', { error });
      throw new ApiError(error);
    }
  };

  getCurrencyList = async (): Promise<GetCurrencyListResponse> => {
    try {
      const apiResponse = await getCurrencyList();
      const response: GetCurrencyListResponse = currencyConfig.responses.list(
        apiResponse
      );
      logger.debug('BccApi::getCurrencyList success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::getCurrencyList error', { error });
      throw new ApiError(error);
    }
  };

  getCurrencyRate = async (
    currency: GetCurrencyRateRequest
  ): Promise<GetCurrencyRateResponse> => {
    try {
      const apiResponse = await getCurrencyRate(currency);
      const response: GetCurrencyRateResponse = currencyConfig.responses.rate(
        apiResponse
      );
      logger.debug('BccApi::getCurrencyRate success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::getCurrencyRate error', { error });
      throw new ApiError(error);
    }
  };

  restoreLegacyWallet = async (
    request: RestoreLegacyWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::restoreLegacyWallet called', {
      parameters: filterLogData(request),
    });
    const { recoveryPhrase, walletName, spendingPassword } = request;
    const walletInitData = {
      style: 'random',
      name: walletName,
      mnemonic_sentence: recoveryPhrase,
      passphrase: spendingPassword,
    };
    try {
      const legacyWallet: LegacyBccWallet = await restoreLegacyWallet(
        this.config,
        { walletInitData }
      );
      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
      };
      const wallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::restoreLegacyWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreLegacyWallet error', { error });
      throw new ApiError(error)
        .set('forbiddenMnemonic')
        .where('message', 'JSONValidationFailed')
        .inc(
          'diagnostic.validationError',
          'Forbidden Mnemonic: an example Mnemonic has been submitted'
        )
        .set('forbiddenMnemonic')
        .where('code', 'invalid_restoration_parameters')
        .result();
    }
  };

  restoreColeRandomWallet = async (
    request: RestoreLegacyWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::restoreColeRandomWallet called', {
      parameters: filterLogData(request),
    });
    const { recoveryPhrase, walletName, spendingPassword } = request;
    const walletInitData = {
      name: walletName,
      mnemonic_sentence: recoveryPhrase,
      passphrase: spendingPassword,
    };
    const type = WALLET_COLE_KINDS.RANDOM;
    try {
      const legacyWallet: LegacyBccWallet = await restoreColeWallet(
        this.config,
        { walletInitData },
        type
      );

      // Generate address for the newly restored Cole wallet
      const { id: walletId } = legacyWallet;
      const address: Address = await createColeWalletAddress(this.config, {
        passphrase: spendingPassword,
        walletId,
      });
      logger.debug('BccApi::createAddress (Cole) success', { address });

      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
      };
      const wallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::restoreColeRandomWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreColeRandomWallet error', { error });
      throw new ApiError(error)
        .set('forbiddenMnemonic')
        .where('message', 'JSONValidationFailed')
        .inc(
          'diagnostic.validationError',
          'Forbidden Mnemonic: an example Mnemonic has been submitted'
        )
        .set('forbiddenMnemonic')
        .where('code', 'invalid_restoration_parameters')
        .result();
    }
  };

  restoreColeIcarusWallet = async (
    request: RestoreLegacyWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::restoreColeIcarusWallet called', {
      parameters: filterLogData(request),
    });
    const { recoveryPhrase, walletName, spendingPassword } = request;
    const walletInitData = {
      name: walletName,
      mnemonic_sentence: recoveryPhrase,
      passphrase: spendingPassword,
    };
    const type = WALLET_COLE_KINDS.ICARUS;
    try {
      const legacyWallet: LegacyBccWallet = await restoreColeWallet(
        this.config,
        { walletInitData },
        type
      );
      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
      };
      const wallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::restoreColeIcarusWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreColeIcarusWallet error', { error });
      throw new ApiError(error)
        .set('forbiddenMnemonic')
        .where('message', 'JSONValidationFailed')
        .inc(
          'diagnostic.validationError',
          'Forbidden Mnemonic: an example Mnemonic has been submitted'
        )
        .set('forbiddenMnemonic')
        .where('code', 'invalid_restoration_parameters')
        .result();
    }
  };

  restoreColeTrezorWallet = async (
    request: RestoreLegacyWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::restoreColeTrezorWallet called', {
      parameters: filterLogData(request),
    });
    const { recoveryPhrase, walletName, spendingPassword } = request;
    const walletInitData = {
      name: walletName,
      mnemonic_sentence: recoveryPhrase,
      passphrase: spendingPassword,
    };
    const type = WALLET_COLE_KINDS.TREZOR;
    try {
      const legacyWallet: LegacyBccWallet = await restoreColeWallet(
        this.config,
        { walletInitData },
        type
      );
      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
      };
      const wallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::restoreColeTrezorWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreColeTrezorWallet error', { error });
      throw new ApiError(error)
        .set('forbiddenMnemonic')
        .where('message', 'JSONValidationFailed')
        .inc(
          'diagnostic.validationError',
          'Forbidden Mnemonic: an example Mnemonic has been submitted'
        )
        .set('forbiddenMnemonic')
        .where('code', 'invalid_restoration_parameters')
        .result();
    }
  };

  restoreColeLedgerWallet = async (
    request: RestoreLegacyWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::restoreColeLedgerWallet called', {
      parameters: filterLogData(request),
    });
    const { recoveryPhrase, walletName, spendingPassword } = request;
    const walletInitData = {
      name: walletName,
      mnemonic_sentence: recoveryPhrase,
      passphrase: spendingPassword,
    };
    const type = WALLET_COLE_KINDS.LEDGER;
    try {
      const legacyWallet: LegacyBccWallet = await restoreColeWallet(
        this.config,
        { walletInitData },
        type
      );
      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
      };
      const wallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::restoreColeLedgerWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreColeLedgerWallet error', { error });
      throw new ApiError(error)
        .set('forbiddenMnemonic')
        .where('message', 'JSONValidationFailed')
        .inc(
          'diagnostic.validationError',
          'Forbidden Mnemonic: an example Mnemonic has been submitted'
        )
        .set('forbiddenMnemonic')
        .where('code', 'invalid_restoration_parameters')
        .result();
    }
  };

  restoreExportedColeWallet = async (
    request: RestoreExportedColeWalletRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::restoreExportedColeWallet called', {
      name: request.name,
    });
    try {
      const legacyWallet: LegacyBccWallet = await restoreExportedColeWallet(
        this.config,
        { walletInitData: request }
      );
      const extraLegacyWalletProps = {
        address_pool_gap: 0, // Not needed for legacy wallets
        delegation: {
          active: {
            status: WalletDelegationStatuses.NOT_DELEGATING,
          },
        },
        isLegacy: true,
      };
      const wallet = {
        ...legacyWallet,
        ...extraLegacyWalletProps,
      };
      logger.debug('BccApi::restoreExportedColeWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::restoreExportedColeWallet error', { error });
      throw new ApiError(error);
    }
  };

  importWalletFromKey = async (
    request: ImportWalletFromKeyRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::importWalletFromKey called', {
      parameters: filterLogData(request),
    });
    const { filePath, spendingPassword } = request;
    try {
      const importedWallet: BccWallet = await importWalletAsKey(this.config, {
        filePath,
        spendingPassword: spendingPassword || '',
      });
      logger.debug('BccApi::importWalletFromKey success', { importedWallet });
      return _createWalletFromServerData(importedWallet);
    } catch (error) {
      logger.error('BccApi::importWalletFromKey error', { error });
      throw new ApiError(error)
        .set('walletAlreadyImported', true)
        .where('code', 'wallet_already_exists')
        .result('walletFileImportError');
    }
  };

  importWalletFromFile = async (
    request: ImportWalletFromFileRequest
  ): Promise<Wallet> => {
    logger.debug('BccApi::importWalletFromFile called', {
      parameters: filterLogData(request),
    });
    const { filePath, spendingPassword } = request;
    const isKeyFile = filePath.split('.').pop().toLowerCase() === 'key';
    try {
      const importedWallet: BccWallet = isKeyFile
        ? await importWalletAsKey(this.config, {
            filePath,
            spendingPassword,
          })
        : await importWalletAsJSON(this.config, filePath);
      logger.debug('BccApi::importWalletFromFile success', { importedWallet });
      return _createWalletFromServerData(importedWallet);
    } catch (error) {
      logger.error('BccApi::importWalletFromFile error', { error });
      throw new ApiError(error)
        .set('walletAlreadyImported', true)
        .where('code', 'wallet_already_exists')
        .result('walletFileImportError');
    }
  };

  updateWallet = async (request: UpdateWalletRequest): Promise<Wallet> => {
    logger.debug('BccApi::updateWallet called', {
      parameters: filterLogData(request),
    });
    const { walletId, name, isLegacy } = request;

    try {
      let wallet: BccWallet;
      if (isLegacy) {
        const response = await updateColeWallet(this.config, {
          walletId,
          name,
        });
        wallet = {
          ...response,
          address_pool_gap: 0, // Not needed for legacy wallets
          delegation: {
            active: {
              status: WalletDelegationStatuses.NOT_DELEGATING,
            },
          },
          isLegacy: true,
        };
      } else {
        wallet = await updateWallet(this.config, { walletId, name });
      }
      logger.debug('BccApi::updateWallet success', { wallet });
      return _createWalletFromServerData(wallet);
    } catch (error) {
      logger.error('BccApi::updateWallet error', { error });
      throw new ApiError(error);
    }
  };

  updateSpendingPassword = async (
    request: UpdateSpendingPasswordRequest
  ): Promise<boolean> => {
    logger.debug('BccApi::updateSpendingPassword called', {
      parameters: filterLogData(request),
    });
    const { walletId, oldPassword, newPassword, isLegacy } = request;
    try {
      if (isLegacy) {
        await updateColeSpendingPassword(this.config, {
          walletId,
          oldPassword,
          newPassword,
        });

        if (!oldPassword) {
          // Generate address for the Cole wallet for which password was set for the 1st time
          const address: Address = await createColeWalletAddress(this.config, {
            passphrase: newPassword,
            walletId,
          });
          logger.debug('BccApi::createAddress (Cole) success', { address });
        }
      } else {
        await updateSpendingPassword(this.config, {
          walletId,
          oldPassword,
          newPassword,
        });
      }
      logger.debug('BccApi::updateSpendingPassword success');
      return true;
    } catch (error) {
      logger.error('BccApi::updateSpendingPassword error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  quitStakePool = async (
    request: QuitStakePoolRequest
  ): Promise<Transaction> => {
    logger.debug('BccApi::quitStakePool called', {
      parameters: filterLogData(request),
    });
    const { walletId, passphrase } = request;
    try {
      const result = await quitStakePool(this.config, {
        walletId,
        passphrase,
      });
      logger.debug('BccApi::quitStakePool success', { result });
      return result;
    } catch (error) {
      logger.error('BccApi::quitStakePool error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  getSmashSettings = async (): Promise<GetSmashSettingsApiResponse> => {
    logger.debug('BccApi::getSmashSettings called');
    try {
      const {
        pool_metadata_source: poolMetadataSource,
      } = await getSmashSettings(this.config);
      logger.debug('BccApi::getSmashSettings success', { poolMetadataSource });
      return poolMetadataSource;
    } catch (error) {
      logger.error('BccApi::getSmashSettings error', { error });
      throw new ApiError(error);
    }
  };

  checkSmashServerIsValid = async (url: string): Promise<boolean> => {
    logger.debug('BccApi::checkSmashServerIsValid called', {
      parameters: { url },
    });
    try {
      if (url === SMASH_SERVERS_LIST.direct.url) {
        return true;
      }
      const {
        health,
      }: CheckSmashServerHealthApiResponse = await checkSmashServerHealth(
        this.config,
        url
      );
      const isValid = health === SMASH_SERVER_STATUSES.AVAILABLE;
      logger.debug('BccApi::checkSmashServerIsValid success', { isValid });
      return isValid;
    } catch (error) {
      logger.error('BccApi::checkSmashServerIsValid error', { error });
      throw new ApiError(error);
    }
  };

  updateSmashSettings = async (
    poolMetadataSource: PoolMetadataSource
  ): Promise<void> => {
    logger.debug('BccApi::updateSmashSettings called', {
      parameters: { poolMetadataSource },
    });
    try {
      const isSmashServerValid = await this.checkSmashServerIsValid(
        poolMetadataSource
      );
      if (!isSmashServerValid) {
        const error = {
          code: 'invalid_smash_server',
        };
        throw new ApiError(error);
      }
      await updateSmashSettings(this.config, poolMetadataSource);
      logger.debug('BccApi::updateSmashSettings success', {
        poolMetadataSource,
      });
    } catch (error) {
      const id = get(error, 'id');
      const message = get(error, 'values.message');
      if (
        id === 'api.errors.GenericApiError' &&
        message ===
          'Error parsing query parameter url failed: URI must not contain a path/query/fragment.'
      ) {
        throw new ApiError({
          code: 'invalid_smash_server',
        });
      }
      logger.error('BccApi::updateSmashSettings error', { error });
      throw new ApiError(error);
    }
  };

  getRedeemItnRewardsFee = async (
    request: GetRedeemItnRewardsFeeRequest
  ): Promise<GetRedeemItnRewardsFeeResponse> => {
    const { address, wallet, recoveryPhrase: withdrawal } = request;
    const {
      id: walletId,
      amount: walletBalance,
      availableAmount,
      reward: rewardsBalance,
    } = wallet;
    const minRewardsReceiverBalance = new BigNumber(
      MIN_REWARDS_REDEMPTION_RECEIVER_BALANCE
    );
    // Amount is set to either wallet's balance in case balance is less than 3 BCC or 1 BCC in order to avoid min UTXO affecting transaction fees calculation
    const amount = walletBalance.isLessThan(
      minRewardsReceiverBalance.times(
        MIN_REWARDS_REDEMPTION_RECEIVER_BALANCE * 3
      )
    )
      ? formattedAmountToEntropic(walletBalance.toString())
      : REWARDS_REDEMPTION_FEE_CALCULATION_AMOUNT;
    const payload = {
      address,
      walletId,
      walletBalance,
      availableBalance: availableAmount.plus(rewardsBalance),
      rewardsBalance,
      amount,
      withdrawal,
      isLegacy: false,
    };
    try {
      const { fee } = await this.calculateTransactionFee(payload);
      logger.debug('BccApi::getRedeemItnRewardsFee success', { fee });
      return fee;
    } catch (error) {
      logger.error('BccApi::getRedeemItnRewardsFee error', { error });
      throw new ApiError(error);
    }
  };

  requestRedeemItnRewards = async (
    request: RequestRedeemItnRewardsRequest
  ): Promise<RequestRedeemItnRewardsResponse> => {
    const {
      address,
      walletId,
      spendingPassword: passphrase,
      recoveryPhrase: withdrawal,
    } = request;
    const amount = REWARDS_REDEMPTION_FEE_CALCULATION_AMOUNT;
    try {
      const data = {
        payments: [
          {
            address,
            amount: {
              quantity: amount,
              unit: WalletUnits.ENTROPIC,
            },
          },
        ],
        passphrase,
        withdrawal,
      };
      const transaction = await createTransaction(this.config, {
        walletId,
        data,
      });
      const response = _createRedeemItnRewardsFromServerData(transaction);
      logger.debug('BccApi::requestRedeemItnRewards success', {
        response,
      });
      return response;
    } catch (error) {
      logger.error('BccApi::requestRedeemItnRewards error', { error });
      throw new ApiError(error);
    }
  };

  exportWalletToFile = async (
    request: ExportWalletToFileRequest
  ): Promise<[]> => {
    const { walletId, filePath } = request;
    logger.debug('BccApi::exportWalletToFile called', {
      parameters: filterLogData(request),
    });
    try {
      const response: Promise<[]> = await exportWalletAsJSON(this.config, {
        walletId,
        filePath,
      });
      logger.debug('BccApi::exportWalletToFile success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::exportWalletToFile error', { error });
      throw new ApiError(error);
    }
  };

  getWalletUtxos = async (
    request: GetWalletUtxosRequest
  ): Promise<WalletUtxos> => {
    const { walletId, isLegacy } = request;
    logger.debug('BccApi::getWalletUtxos called', {
      parameters: filterLogData(request),
    });
    try {
      let response: WalletUtxos;
      if (isLegacy) {
        response = await getColeWalletUtxos(this.config, { walletId });
      } else {
        response = await getWalletUtxos(this.config, { walletId });
      }
      logger.debug('BccApi::getWalletUtxos success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::getWalletUtxos error', { error });
      throw new ApiError(error);
    }
  };

  transferFundsCalculateFee = async (
    request: TransferFundsCalculateFeeRequest
  ): Promise<TransferFundsCalculateFeeResponse> => {
    const { sourceWalletId } = request;
    logger.debug('BccApi::transferFundsCalculateFee called', {
      parameters: { sourceWalletId },
    });
    try {
      const response: TransferFundsCalculateFeeApiResponse = await transferFundsCalculateFee(
        this.config,
        {
          sourceWalletId,
        }
      );
      logger.debug('BccApi::transferFundsCalculateFee success', { response });
      return _createMigrationFeeFromServerData(response);
    } catch (error) {
      logger.error('BccApi::transferFundsCalculateFee error', { error });
      throw new ApiError(error);
    }
  };

  transferFunds = async (
    request: TransferFundsRequest
  ): Promise<TransferFundsResponse> => {
    const { sourceWalletId, targetWalletAddresses, passphrase } = request;
    logger.debug('BccApi::transferFunds called', {
      parameters: { sourceWalletId, targetWalletAddresses },
    });

    if (!targetWalletAddresses) {
      throw new ApiError({
        code: 'no_such_wallet',
        message: 'Target wallet does not exist',
      }).result();
    }

    try {
      const response: TransferFundsResponse = await transferFunds(this.config, {
        sourceWalletId,
        targetWalletAddresses,
        passphrase,
      });
      logger.debug('BccApi::transferFunds success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::transferFunds error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  getStakePools = async (stake: number = 0): Promise<Array<StakePool>> => {
    logger.debug('BccApi::getStakePools called', {
      parameters: { stake },
    });
    try {
      const response: BccApiStakePools = await getStakePools(
        this.config,
        stake
      );
      const stakePools = response
        .filter(({ metadata }: BccApiStakePool) => metadata !== undefined)
        .filter(({ flags }: BccApiStakePool) => !flags.includes('delisted'))
        .filter(
          ({ margin }: BccApiStakePool) =>
            margin !== undefined && margin.quantity < 100
        )
        .map(_createStakePoolFromServerData);
      logger.debug('BccApi::getStakePools success', {
        stakePoolsTotal: response.length,
        stakePoolsWithMetadata: stakePools.length,
        unfilteredStakePools: response,
      });
      return stakePools;
    } catch (error) {
      logger.error('BccApi::getStakePools error', { error });
      throw new ApiError(error);
    }
  };

  testReset = async (): Promise<void> => {
    logger.debug('BccApi::testReset called');
    try {
      const wallets = await this.getWallets();
      await Promise.all(
        wallets.map((wallet) =>
          this.deleteWallet({
            walletId: wallet.id,
            isLegacy: wallet.isLegacy,
            isHardwareWallet: wallet.isHardwareWallet,
          })
        )
      );
      logger.debug('BccApi::testReset success');
    } catch (error) {
      logger.error('BccApi::testReset error', { error });
      throw new ApiError(error);
    }
  };

  getNetworkInfo = async (): Promise<GetNetworkInfoResponse> => {
    logger.debug('BccApi::getNetworkInfo called');
    try {
      const networkInfo: NetworkInfoResponse = await getNetworkInfo(
        this.config
      );
      logger.debug('BccApi::getNetworkInfo success', { networkInfo });
      const {
        sync_progress: syncProgressRaw,
        node_tip: nodeTip,
        network_tip: networkTip,
        next_epoch: nextEpoch,
      } = networkInfo;

      const syncProgress =
        get(syncProgressRaw, 'status') === 'ready'
          ? 100
          : get(syncProgressRaw, 'progress.quantity', 0);
      const nextEpochNumber = get(nextEpoch, 'epoch_number', null);
      const nextEpochStartTime = get(nextEpoch, 'epoch_start_time', '');
      // extract relevant data before sending to NetworkStatusStore
      return {
        syncProgress,
        localTip: {
          epoch: get(nodeTip, 'epoch_number', 0),
          slot: get(nodeTip, 'slot_number', 0),
          absoluteSlotNumber: get(nodeTip, 'absolute_slot_number', 0),
        },
        networkTip: networkTip
          ? {
              epoch: get(networkTip, 'epoch_number', 0),
              slot: get(networkTip, 'slot_number', 0),
              absoluteSlotNumber: get(networkTip, 'absolute_slot_number', 0),
            }
          : null,
        nextEpoch: nextEpoch
          ? {
              // N+1 epoch
              epochNumber: nextEpochNumber,
              epochStart: nextEpochStartTime,
            }
          : null,
      };
    } catch (error) {
      logger.error('BccApi::getNetworkInfo error', { error });
      // Special Error case
      if (
        error.code === TlsCertificateNotValidError.API_ERROR ||
        error.code === 'EPROTO'
      ) {
        throw new TlsCertificateNotValidError();
      }
      throw new ApiError(error);
    }
  };

  getNetworkClock = async (
    isForceCheck: boolean
  ): Promise<GetNetworkClockResponse> => {
    logger.debug('BccApi::getNetworkClock called', { isForceCheck });
    try {
      const networkClock: NetworkClockResponse = await getNetworkClock(
        this.config,
        isForceCheck
      );
      logger.debug('BccApi::getNetworkClock success', {
        networkClock,
        isForceCheck,
      });
      return {
        status: networkClock.status,
        offset: get(networkClock, 'offset.quantity', null),
      };
    } catch (error) {
      logger.error('BccApi::getNetworkClock error', { error, isForceCheck });
      throw new ApiError(error);
    }
  };

  getNetworkParameters = async (): Promise<GetNetworkParametersResponse> => {
    logger.debug('BccApi::getNetworkParameters called');
    try {
      const networkParameters: GetNetworkParametersApiResponse = await getNetworkParameters(
        this.config
      );
      logger.debug('BccApi::getNetworkParameters success', {
        networkParameters,
      });

      const {
        genesis_block_hash: genesisBlockHash,
        blockchain_start_time, // eslint-disable-line
        slot_length: slotLength,
        epoch_length: epochLength,
        security_parameter: securityParameter,
        active_slot_coefficient: activeSlotCoefficient,
        decentralization_level: decentralizationLevel,
        desired_pool_number: desiredPoolNumber,
        minimum_utxo_value: minimumUtxoValue,
        eras,
      } = networkParameters;
      const blockchainStartTime = moment(blockchain_start_time).valueOf();

      return {
        genesisBlockHash,
        blockchainStartTime,
        slotLength,
        epochLength,
        securityParameter,
        activeSlotCoefficient,
        decentralizationLevel,
        desiredPoolNumber,
        minimumUtxoValue,
        eras,
      };
    } catch (error) {
      logger.error('BccApi::getNetworkParameters error', { error });
      throw new ApiError(error);
    }
  };

  getNews = async (): Promise<GetNewsResponse> => {
    logger.debug('BccApi::getNews called');

    // Fetch news json
    let rawNews: string;
    let news: GetNewsResponse;
    try {
      rawNews = await getNews();
      news = JSON.parse(rawNews);
    } catch (error) {
      logger.error('BccApi::getNews error', { error });
      throw new Error('Unable to fetch news');
    }

    // Fetch news verification hash
    let newsHash: string;
    let expectedNewsHash: string;
    try {
      newsHash = await getSHA256HexForString(rawNews);
      expectedNewsHash = await getNewsHash(news.updatedAt);
    } catch (error) {
      logger.error('BccApi::getNews (hash) error', { error });
      throw new Error('Unable to fetch news hash');
    }

    if (newsHash !== expectedNewsHash) {
      throw new Error('Newsfeed could not be verified');
    }

    logger.debug('BccApi::getNews success', {
      updatedAt: news.updatedAt,
      items: news.items.length,
    });
    return news;
  };

  calculateDelegationFee = async (
    request: GetDelegationFeeRequest
  ): Promise<DelegationCalculateFeeResponse> => {
    logger.debug('BccApi::calculateDelegationFee called', {
      parameters: filterLogData(request),
    });
    try {
      const response: TransactionFee = await getDelegationFee(this.config, {
        walletId: request.walletId,
      });
      logger.debug('BccApi::calculateDelegationFee success', { response });
      return _createDelegationFeeFromServerData(response);
    } catch (error) {
      logger.error('BccApi::calculateDelegationFee error', { error });
      throw new ApiError(error);
    }
  };

  joinStakePool = async (
    request: JoinStakePoolRequest
  ): Promise<Transaction> => {
    logger.debug('BccApi::joinStakePool called', {
      parameters: filterLogData(request),
    });
    const { walletId, stakePoolId, passphrase } = request;
    try {
      const response = await joinStakePool(this.config, {
        walletId,
        stakePoolId,
        passphrase,
      });
      logger.debug('BccApi::joinStakePool success', {
        stakePool: response,
      });
      return response;
    } catch (error) {
      logger.error('BccApi::joinStakePool error', { error });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .result();
    }
  };

  createWalletSignature = async (
    request: CreateWalletSignatureRequest
  ): Promise<Buffer> => {
    logger.debug('BccApi::createWalletSignature called', {
      parameters: filterLogData(request),
    });
    const {
      walletId,
      role,
      index,
      passphrase,
      votingKey,
      stakeKey,
      addressHex,
      absoluteSlotNumber,
    } = request;

    try {
      const data = {
        passphrase,
        metadata: {
          [61284]: {
            map: [
              {
                k: {
                  int: 1,
                },
                v: {
                  bytes: votingKey,
                },
              },
              {
                k: {
                  int: 2,
                },
                v: {
                  bytes: stakeKey,
                },
              },
              {
                k: {
                  int: 3,
                },
                v: {
                  bytes: addressHex,
                },
              },
              {
                k: {
                  int: 4,
                },
                v: {
                  int: absoluteSlotNumber,
                },
              },
            ],
          },
        },
      };
      const response = await createWalletSignature(this.config, {
        walletId,
        role,
        index,
        data,
      });
      logger.debug('BccApi::createWalletSignature success', { response });
      return response;
    } catch (error) {
      logger.error('BccApi::createWalletSignature error', { error });
      throw new ApiError(error);
    }
  };

  createVotingRegistrationTransaction = async (
    request: CreateVotingRegistrationRequest
  ): Promise<WalletTransaction> => {
    logger.debug('BccApi::createVotingRegistrationTransaction called', {
      parameters: filterLogData(request),
    });
    const {
      walletId,
      address,
      addressHex,
      amount,
      passphrase,
      votingKey,
      stakeKey,
      signature,
      absoluteSlotNumber,
    } = request;

    try {
      const data = {
        payments: [
          {
            address,
            amount: {
              quantity: amount,
              unit: WalletUnits.ENTROPIC,
            },
          },
        ],
        passphrase,
        metadata: {
          [61284]: {
            map: [
              {
                k: {
                  int: 1,
                },
                v: {
                  bytes: votingKey,
                },
              },
              {
                k: {
                  int: 2,
                },
                v: {
                  bytes: stakeKey,
                },
              },
              {
                k: {
                  int: 3,
                },
                v: {
                  bytes: addressHex,
                },
              },
              {
                k: {
                  int: 4,
                },
                v: {
                  int: absoluteSlotNumber,
                },
              },
            ],
          },
          [61285]: {
            map: [
              {
                k: {
                  int: 1,
                },
                v: {
                  bytes: signature,
                },
              },
            ],
          },
        },
      };
      const response: Transaction = await createTransaction(this.config, {
        walletId,
        data: { ...data },
      });

      logger.debug('BccApi::createVotingRegistrationTransaction success', {
        transaction: response,
      });

      return _createTransactionFromServerData(response);
    } catch (error) {
      logger.error('BccApi::createVotingRegistrationTransaction error', {
        error,
      });
      throw new ApiError(error)
        .set('wrongEncryptionPassphrase')
        .where('code', 'bad_request')
        .inc('message', 'passphrase is too short')
        .set('transactionIsTooBig', true, {
          linkLabel: 'tooBigTransactionErrorLinkLabel',
          linkURL: 'tooBigTransactionErrorLinkURL',
        })
        .where('code', 'transaction_is_too_big')
        .result();
    }
  };

  setBccNodeFault = async (fault: FaultInjectionIpcRequest) => {
    await bccFaultInjectionChannel.send(fault);
  };

  // No implementation here but can be overwritten
  setLocalTimeDifference: Function;
  setSyncProgress: Function;
  setFaultyNodeSettingsApi: boolean;
  resetTestOverrides: Function;

  // Newsfeed testing utility
  setTestingNewsFeed: (testingNewsFeedData: GetNewsResponse) => void;
  setTestingStakePools: (testingStakePoolsData: Array<StakePoolProps>) => void;
  setTestingWallets: (testingWalletsData: Array<WalletProps>) => void;
  setTestingWallet: (testingWalletData: Object, walletIndex?: number) => void;

  // Stake pools testing utility
  setFakeStakePoolsJsonForTesting: (
    fakeStakePoolsJson: Array<StakePool>
  ) => void;
  setStakePoolsFetchingFailed: () => void;
}

// ========== TRANSFORM SERVER DATA INTO FRONTEND MODELS =========

const _createWalletFromServerData = action(
  'BccApi::_createWalletFromServerData',
  (wallet: BccWallet) => {
    const {
      id: rawWalletId,
      address_pool_gap: addressPoolGap,
      balance,
      name,
      assets,
      passphrase,
      delegation,
      state: syncState,
      isLegacy = false,
      discovery,
      isHardwareWallet = false,
    } = wallet;

    const id = isLegacy ? getLegacyWalletId(rawWalletId) : rawWalletId;
    const passphraseLastUpdatedAt = get(passphrase, 'last_updated_at', null);
    const walletTotalAmount =
      balance.total.unit === WalletUnits.ENTROPIC
        ? new BigNumber(balance.total.quantity.toString()).dividedBy(
            ENTROPICS_PER_BCC
          )
        : new BigNumber(balance.total.quantity.toString());
    const walletAvailableAmount =
      balance.available.unit === WalletUnits.ENTROPIC
        ? new BigNumber(balance.available.quantity.toString()).dividedBy(
            ENTROPICS_PER_BCC
          )
        : new BigNumber(balance.available.quantity.toString());
    let walletRewardAmount = new BigNumber(0);
    if (!isLegacy) {
      walletRewardAmount =
        balance.reward.unit === WalletUnits.ENTROPIC
          ? new BigNumber(balance.reward.quantity.toString()).dividedBy(
              ENTROPICS_PER_BCC
            )
          : new BigNumber(balance.reward.quantity.toString());
    }

    // Current (Active)
    const active = get(delegation, 'active', null);
    const target = get(active, 'target', null);
    const status = get(active, 'status', null);
    const delegatedStakePoolId = isLegacy ? null : target;
    const delegationStakePoolStatus = isLegacy ? null : status;

    // Last
    const next = get(delegation, 'next', null);
    const lastPendingStakePool = next ? last(next) : null;
    const lastTarget = get(lastPendingStakePool, 'target', null);
    const lastStatus = get(lastPendingStakePool, 'status', null);
    const lastDelegatedStakePoolId = isLegacy ? null : lastTarget;
    const lastDelegationStakePoolStatus = isLegacy ? null : lastStatus;

    // Mapping asset items from server data
    const walletAssets = {
      available: assets.available.map((item) => {
        const { policy_id: policyId, asset_name: assetName, quantity } = item;
        const uniqueId = `${policyId}${assetName}`;
        return {
          uniqueId,
          policyId,
          assetName,
          quantity: new BigNumber(quantity.toString()),
        };
      }),
      total: assets.total.map((item) => {
        const { policy_id: policyId, asset_name: assetName, quantity } = item;
        const uniqueId = `${policyId}${assetName}`;
        return {
          uniqueId,
          policyId,
          assetName,
          quantity: new BigNumber(quantity.toString()),
        };
      }),
    };

    return new Wallet({
      id,
      addressPoolGap,
      name,
      amount: walletTotalAmount,
      availableAmount: walletAvailableAmount,
      reward: walletRewardAmount,
      assets: walletAssets,
      passwordUpdateDate:
        passphraseLastUpdatedAt && new Date(passphraseLastUpdatedAt),
      hasPassword: isHardwareWallet || passphraseLastUpdatedAt !== null, // For HW set that wallet has password
      syncState,
      isLegacy,
      isHardwareWallet,
      delegatedStakePoolId,
      delegationStakePoolStatus,
      lastDelegatedStakePoolId,
      lastDelegationStakePoolStatus,
      pendingDelegations: next,
      discovery,
    });
  }
);

const _createAddressFromServerData = action(
  'BccApi::_createAddressFromServerData',
  (address: Address) => {
    const { id, state, derivation_path: derivationPath } = address;
    return new WalletAddress({
      id,
      used: state === 'used',
      spendingPath: derivationPathToAddressPath(derivationPath), // E.g. "1852'/1815'/0'/0/19",
    });
  }
);

const _conditionToTxState = (condition: string) => {
  switch (condition) {
    case 'pending':
      return TransactionStates.PENDING;
    case 'expired':
      return TransactionStates.FAILED;
    default:
      return TransactionStates.OK;
  }
};

const _createTransactionFromServerData = action(
  'BccApi::_createTransactionFromServerData',
  (data: Transaction) => {
    const {
      id,
      amount,
      fee,
      deposit,
      inserted_at: insertedAt,
      pending_since: pendingSince,
      depth,
      direction,
      inputs,
      outputs,
      withdrawals,
      status,
      metadata,
    } = data;
    const state = _conditionToTxState(status);
    const stateInfo =
      state === TransactionStates.PENDING ? pendingSince : insertedAt;
    const date = get(stateInfo, 'time');
    const slotNumber = get(stateInfo, ['block', 'slot_number'], null);
    const epochNumber = get(stateInfo, ['block', 'epoch_number'], null);
    const confirmations = get(depth, 'quantity', 0);

    // Mapping asset items from server data
    const outputAssets = flatten(
      outputs.map(({ assets, address }) =>
        assets ? assets.map((asset) => ({ ...asset, address })) : []
      )
    );
    const transactionAssets = map(
      outputAssets,
      ({ policy_id: policyId, asset_name: assetName, quantity, address }) => ({
        policyId,
        assetName,
        quantity: new BigNumber(quantity.toString()),
        address,
      })
    );
    return new WalletTransaction({
      id,
      confirmations,
      slotNumber,
      epochNumber,
      title: direction === 'outgoing' ? 'Bcc sent' : 'Bcc received',
      type:
        direction === 'outgoing'
          ? TransactionTypes.EXPEND
          : TransactionTypes.INCOME,
      amount: new BigNumber(
        direction === 'outgoing'
          ? `-${amount.quantity.toString()}`
          : amount.quantity.toString()
      ).dividedBy(ENTROPICS_PER_BCC),
      fee: new BigNumber(fee.quantity.toString()).dividedBy(ENTROPICS_PER_BCC),
      deposit: new BigNumber(deposit.quantity.toString()).dividedBy(
        ENTROPICS_PER_BCC
      ),
      assets: transactionAssets,
      date: utcStringToDate(date),
      description: '',
      addresses: {
        from: inputs.map(({ address }) => address || null),
        to: outputs.map(({ address }) => address),
        withdrawals: withdrawals.map(({ stake_address: address }) => address),
      },
      state,
      metadata,
    });
  }
);

const _createAssetFromServerData = action(
  'BccApi::_createAssetFromServerData',
  (
    data: ApiAsset,
    localData: AssetLocalData,
    storedAssetMetadata: StoredAssetMetadata
  ) => {
    const {
      policy_id: policyId,
      asset_name: assetName,
      fingerprint,
      metadata,
    } = data;
    const uniqueId = `${policyId}${assetName}`;
    const storedMetadata = storedAssetMetadata[uniqueId];
    const { decimals } = localData;
    const { decimals: recommendedDecimals = null } =
      metadata || storedMetadata || {};
    if (metadata) {
      storedAssetMetadata[uniqueId] = metadata;
    }
    return new Asset({
      policyId,
      assetName,
      fingerprint,
      metadata: metadata || storedMetadata,
      decimals,
      recommendedDecimals,
      uniqueId,
    });
  }
);

const _createTransactionFeeFromServerData = action(
  'BccApi::_createTransactionFeeFromServerData',
  (data: TransactionFee) => {
    const feeAmount = get(data, ['estimated_max', 'quantity'], 0);
    const minimumBccAmount = get(data, 'minimum_coins.[0].quantity', 0);
    const fee = new BigNumber(feeAmount.toString()).dividedBy(
      ENTROPICS_PER_BCC
    );
    const minimumBcc = new BigNumber(minimumBccAmount.toString()).dividedBy(
      ENTROPICS_PER_BCC
    );
    return {
      fee,
      minimumBcc,
    };
  }
);

const _createMigrationFeeFromServerData = action(
  'BccApi::_createMigrationFeeFromServerData',
  (data: TransferFundsCalculateFeeApiResponse) => {
    const { quantity: feeAmount = 0 } = data.migration_cost;
    const fee = new BigNumber(feeAmount.toString()).dividedBy(
      ENTROPICS_PER_BCC
    );
    const { quantity: leftoversAmount = 0 } = data.leftovers;
    const leftovers = new BigNumber(leftoversAmount.toString()).dividedBy(
      ENTROPICS_PER_BCC
    );
    return { fee, leftovers };
  }
);

const _createDelegationFeeFromServerData = action(
  'BccApi::_createDelegationFeeFromServerData',
  (data: TransactionFee) => {
    const fee = new BigNumber(
      get(data, ['estimated_max', 'quantity'], 0).toString()
    ).dividedBy(ENTROPICS_PER_BCC);
    const deposits = new BigNumber(
      get(data, ['deposit', 'quantity'], 0).toString()
    ).dividedBy(ENTROPICS_PER_BCC);
    // @TODO Use api response data when api is ready
    const depositsReclaimed = new BigNumber(0);
    return { fee, deposits, depositsReclaimed };
  }
);

const _createStakePoolFromServerData = action(
  'BccApi::_createStakePoolFromServerData',
  (stakePool: BccApiStakePool, index: number) => {
    const {
      id,
      metrics,
      cost,
      margin: profitMargin,
      metadata,
      pledge,
      retirement,
    } = stakePool;
    const {
      relative_stake: relativeStake,
      produced_blocks: producedBlocks,
      non_myopic_member_rewards: nonMyopicMemberRewards,
      saturation,
    } = metrics; // eslint-disable-line
    const { name, description = '', ticker, homepage } = metadata;
    const relativeStakePercentage = get(relativeStake, 'quantity', 0);
    const producedBlocksCount = get(producedBlocks, 'quantity', 0);
    const nonMyopicMemberRewardsQuantity = get(
      nonMyopicMemberRewards,
      'quantity',
      0
    );
    const costQuantity = get(cost, 'quantity', 0).toString();
    const pledgeQuantity = get(pledge, 'quantity', 0).toString();
    const profitMarginPercentage = get(profitMargin, 'quantity', 0);
    const retiringAt = get(retirement, 'epoch_start_time', null);
    return new StakePool({
      id,
      relativeStake: relativeStakePercentage,
      producedBlocks: producedBlocksCount,
      potentialRewards: new BigNumber(
        nonMyopicMemberRewardsQuantity.toString()
      ).dividedBy(ENTROPICS_PER_BCC),
      nonMyopicMemberRewards: nonMyopicMemberRewardsQuantity,
      ticker,
      homepage,
      cost: new BigNumber(costQuantity.toString()).dividedBy(ENTROPICS_PER_BCC),
      description,
      isCharity: false,
      name,
      pledge: new BigNumber(pledgeQuantity.toString()).dividedBy(
        ENTROPICS_PER_BCC
      ),
      profitMargin: profitMarginPercentage,
      ranking: index + 1,
      retiring: retiringAt ? new Date(retiringAt) : null,
      saturation: saturation * 100,
    });
  }
);

const _createRedeemItnRewardsFromServerData = action(
  'BccApi::_createRedeemItnRewardsFromServerData',
  (transaction: Transaction) => {
    const { quantity, unit } = get(transaction, 'withdrawals[0].amount');
    return unit === WalletUnits.ENTROPIC
      ? new BigNumber(quantity.toString()).dividedBy(ENTROPICS_PER_BCC)
      : new BigNumber(quantity.toString());
  }
);
