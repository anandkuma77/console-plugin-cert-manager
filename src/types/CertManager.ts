import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface EnvVar {
  name: string;
  value?: string;
  valueFrom?: {
    configMapKeyRef?: {
      key: string;
      name?: string;
      optional?: boolean;
    };
    fieldRef?: {
      apiVersion?: string;
      fieldPath: string;
    };
    resourceFieldRef?: {
      containerName?: string;
      divisor?: string;
      resource: string;
    };
    secretKeyRef?: {
      key: string;
      name?: string;
      optional?: boolean;
    };
  };
}

export interface ResourceRequirements {
  limits?: {
    cpu?: string;
    memory?: string;
  };
  requests?: {
    cpu?: string;
    memory?: string;
  };
}

export interface ComponentConfig {
  overrideArgs?: string[];
  overrideEnv?: EnvVar[];
  resources?: ResourceRequirements;
  replicas?: number;
}

export interface CertManagerSpec {
  managementState?: 'Managed' | 'Unmanaged' | 'Removed';
  logLevel?: 'Normal' | 'Debug' | 'Trace' | 'TraceAll';
  operatorLogLevel?: 'Normal' | 'Debug' | 'Trace' | 'TraceAll';
  unsupportedConfigOverrides?: unknown;
  controllerConfig?: ComponentConfig;
  webhookConfig?: ComponentConfig;
  cainjectorConfig?: ComponentConfig;
}

export interface CertManagerCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface CertManagerStatus {
  conditions?: CertManagerCondition[];
  observedGeneration?: number;
  version?: string;
  generations?: Array<{
    group: string;
    resource: string;
    namespace?: string;
    name: string;
    lastGeneration: number;
  }>;
}

export interface CertManager extends K8sResourceCommon {
  apiVersion: 'operator.openshift.io/v1alpha1';
  kind: 'CertManager';
  spec: CertManagerSpec;
  status?: CertManagerStatus;
}

export const CertManagerModel = {
  apiVersion: 'v1alpha1',
  apiGroup: 'operator.openshift.io',
  plural: 'certmanagers',
  namespaced: false,
  kind: 'CertManager',
  id: 'certmanager',
  labelPlural: 'CertManagers',
  label: 'CertManager',
  abbr: 'CM',
};
