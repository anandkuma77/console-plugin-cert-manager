import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface CertificateRequestSpec {
  request: string;
  duration?: string;
  issuerRef: {
    name: string;
    kind?: 'Issuer' | 'ClusterIssuer';
    group?: string;
  };
  isCA?: boolean;
  usages?: string[];
  username?: string;
  uid?: string;
  groups?: string[];
  extra?: { [key: string]: string[] };
}

export interface CertificateRequestCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface CertificateRequestStatus {
  conditions?: CertificateRequestCondition[];
  certificate?: string;
  ca?: string;
  failureTime?: string;
}

export interface CertificateRequest extends K8sResourceCommon {
  apiVersion: 'cert-manager.io/v1';
  kind: 'CertificateRequest';
  spec: CertificateRequestSpec;
  status?: CertificateRequestStatus;
}

export const CertificateRequestModel = {
  apiVersion: 'v1',
  apiGroup: 'cert-manager.io',
  plural: 'certificaterequests',
  namespaced: true,
  kind: 'CertificateRequest',
  id: 'certificaterequest',
  labelPlural: 'CertificateRequests',
  label: 'CertificateRequest',
  abbr: 'CR',
};
