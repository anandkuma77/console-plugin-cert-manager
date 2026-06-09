import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface ACMESolver {
  http01?: {
    ingress?: {
      class?: string;
      name?: string;
      podTemplate?: unknown;
      serviceType?: string;
    };
  };
  dns01?: {
    [key: string]: unknown;
  };
  selector?: {
    dnsNames?: string[];
    dnsZones?: string[];
  };
}

export interface ACMEIssuer {
  email?: string;
  server: string;
  privateKeySecretRef: {
    name: string;
    key?: string;
  };
  skipTLSVerify?: boolean;
  caBundle?: string;
  solvers?: ACMESolver[];
  disableAccountKeyGeneration?: boolean;
  enableDurationFeature?: boolean;
  externalAccountBinding?: {
    keyID: string;
    keySecretRef: {
      name: string;
      key?: string;
    };
    keyAlgorithm?: 'HS256' | 'HS384' | 'HS512';
  };
}

export interface CAIssuer {
  secretName: string;
  crlDistributionPoints?: string[];
  ocspServers?: string[];
}

export interface VaultIssuer {
  server: string;
  path: string;
  auth: {
    tokenSecretRef?: {
      name: string;
      key?: string;
    };
    appRole?: {
      roleId: string;
      secretRef: {
        name: string;
        key?: string;
      };
    };
    kubernetes?: {
      role: string;
      secretRef: {
        name: string;
        key?: string;
      };
    };
  };
  caBundle?: string;
  namespace?: string;
}

export interface VenafiIssuer {
  zone: string;
  tpp?: {
    url: string;
    credentialsRef: {
      name: string;
    };
    caBundle?: string;
  };
  cloud?: {
    url?: string;
    apiTokenSecretRef: {
      name: string;
      key?: string;
    };
  };
}

export interface IssuerSpec {
  acme?: ACMEIssuer;
  ca?: CAIssuer;
  vault?: VaultIssuer;
  venafi?: VenafiIssuer;
  selfSigned?: Record<string, never>;
}

export interface IssuerCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
  observedGeneration?: number;
}

export interface IssuerStatus {
  conditions?: IssuerCondition[];
  acme?: {
    uri?: string;
    lastRegisteredEmail?: string;
  };
}

export interface Issuer extends K8sResourceCommon {
  apiVersion: 'cert-manager.io/v1';
  kind: 'Issuer';
  spec: IssuerSpec;
  status?: IssuerStatus;
}

export interface ClusterIssuer extends K8sResourceCommon {
  apiVersion: 'cert-manager.io/v1';
  kind: 'ClusterIssuer';
  spec: IssuerSpec;
  status?: IssuerStatus;
}

export const IssuerModel = {
  apiVersion: 'v1',
  apiGroup: 'cert-manager.io',
  plural: 'issuers',
  namespaced: true,
  kind: 'Issuer',
  id: 'issuer',
  labelPlural: 'Issuers',
  label: 'Issuer',
  abbr: 'ISS',
};

export const ClusterIssuerModel = {
  apiVersion: 'v1',
  apiGroup: 'cert-manager.io',
  plural: 'clusterissuers',
  namespaced: false,
  kind: 'ClusterIssuer',
  id: 'clusterissuer',
  labelPlural: 'ClusterIssuers',
  label: 'ClusterIssuer',
  abbr: 'CISS',
};
