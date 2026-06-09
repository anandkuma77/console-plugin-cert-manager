import { IssuerSpec } from '../types';

export type IssuerType = 'ACME' | 'CA' | 'Vault' | 'Venafi' | 'SelfSigned' | 'Unknown';

export const getIssuerType = (spec: IssuerSpec): IssuerType => {
  if (spec.acme) {
    return 'ACME';
  } else if (spec.ca) {
    return 'CA';
  } else if (spec.vault) {
    return 'Vault';
  } else if (spec.venafi) {
    return 'Venafi';
  } else if (spec.selfSigned) {
    return 'SelfSigned';
  }
  return 'Unknown';
};

export const getIssuerTypeDisplayName = (spec: IssuerSpec): string => {
  const type = getIssuerType(spec);
  switch (type) {
    case 'ACME':
      return 'ACME';
    case 'CA':
      return 'CA';
    case 'Vault':
      return 'Vault';
    case 'Venafi':
      return 'Venafi';
    case 'SelfSigned':
      return 'Self-Signed';
    default:
      return 'Unknown';
  }
};
