// @flow

export type IntrospectAddressRequest = {
  input: string,
};

export type AddressStyle = 'Cole' | 'Icarus' | 'Quibitous' | 'Sophie';

export type ChainPointer = {
  slot_num: number,
  transaction_index: number,
  output_index: number,
};

export type AddressBase = {
  address_style: AddressStyle,
  network_tag: number | null,
  stake_reference: 'none' | 'by pointer' | 'by value',
};

export type ColeAddress = AddressBase & {
  address_root: string,
  derivation_path: string,
};

export type IcarusAddress = AddressBase & {
  address_root: string,
};

export type QuibitousAddress = AddressBase & {
  address_type: 'single' | 'group' | 'account' | 'multisig',
  account_key?: string,
  merkle_root?: string,
  spending_key?: string,
  stake_key?: string,
};

export type SophieAddress = AddressBase & {
  pointer?: ChainPointer,
  script_hash?: string,
  spending_key_hash?: string,
  stake_key_hash?: string,
  stake_script_hash?: string,
};

export type IntrospectAddressResponse =
  | {
      introspection:
        | ColeAddress
        | IcarusAddress
        | QuibitousAddress
        | SophieAddress,
    }
  | 'Invalid';
