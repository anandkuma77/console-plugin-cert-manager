import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface CertificateAdditionalOutputFormat {
  type: 'DER' | 'CombinedPEM';
}

export interface CertificateKeystores {
  jks?: {
    create: boolean;
    passwordSecretRef: {
      name: string;
      key: string;
    };
  };
  pkcs12?: {
    create: boolean;
    passwordSecretRef: {
      name: string;
      key: string;
    };
  };
}

export interface CertificatePrivateKey {
  algorithm?: 'RSA' | 'ECDSA' | 'Ed25519';
  encoding?: 'PKCS1' | 'PKCS8';
  size?: number;
  rotationPolicy?: 'Never' | 'Always';
}

export interface CertificateIssuerRef {
  name: string;
  kind?: 'Issuer' | 'ClusterIssuer';
  group?: string;
}

export interface CertificateSpec {
  commonName?: string;
  dnsNames?: string[];
  duration?: string;
  emailAddresses?: string[];
  ipAddresses?: string[];
  isCA?: boolean;
  issuerRef: CertificateIssuerRef;
  keystores?: CertificateKeystores;
  literalSubject?: string;
  privateKey?: CertificatePrivateKey;
  renewBefore?: string;
  revisionHistoryLimit?: number;
  secretName: string;
  secretTemplate?: {
    annotations?: { [key: string]: string };
    labels?: { [key: string]: string };
  };
  subject?: {
    countries?: string[];
    localities?: string[];
    organizationalUnits?: string[];
    organizations?: string[];
    postalCodes?: string[];
    provinces?: string[];
    serialNumber?: string;
    streetAddresses?: string[];
  };
  uris?: string[];
  usages?: string[];
  additionalOutputFormats?: CertificateAdditionalOutputFormat[];
}

export interface CertificateCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
  observedGeneration?: number;
}

export interface CertificateStatus {
  conditions?: CertificateCondition[];
  failedIssuanceAttempts?: number;
  lastFailureTime?: string;
  nextPrivateKeySecretName?: string;
  notAfter?: string;
  notBefore?: string;
  renewalTime?: string;
  revision?: number;
}

export interface Certificate extends K8sResourceCommon {
  apiVersion: 'cert-manager.io/v1';
  kind: 'Certificate';
  spec: CertificateSpec;
  status?: CertificateStatus;
}

export const CertificateModel = {
  apiVersion: 'v1',
  apiGroup: 'cert-manager.io',
  plural: 'certificates',
  namespaced: true,
  kind: 'Certificate',
  id: 'certificate',
  labelPlural: 'Certificates',
  label: 'Certificate',
  abbr: 'CERT',
};
