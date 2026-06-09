import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import { CertManager } from '../../types';

export interface CertManagerFormProps {
  obj?: CertManager;
  onChange: (certManager: CertManager) => void;
}

const CertManagerForm: React.FC<CertManagerFormProps> = ({ obj, onChange }) => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');

  const certManager: CertManager = obj || {
    apiVersion: 'operator.openshift.io/v1alpha1',
    kind: 'CertManager',
    metadata: {
      name: 'cluster',
    },
    spec: {
      managementState: 'Managed',
      logLevel: 'Normal',
      controllerConfig: {
        replicas: 1,
        resources: {
          requests: { cpu: '', memory: '' },
          limits: { cpu: '', memory: '' },
        },
      },
      webhookConfig: {
        replicas: 1,
        resources: {
          requests: { cpu: '', memory: '' },
          limits: { cpu: '', memory: '' },
        },
      },
      cainjectorConfig: {
        replicas: 1,
        resources: {
          requests: { cpu: '', memory: '' },
          limits: { cpu: '', memory: '' },
        },
      },
    },
  };

  const updateSpec = (path: string[], value: any) => {
    const updated = JSON.parse(JSON.stringify(certManager));
    let current = updated.spec;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onChange(updated);
  };

  const managementStateOptions = [
    { value: 'Managed', label: 'Managed' },
    { value: 'Unmanaged', label: 'Unmanaged' },
    { value: 'Removed', label: 'Removed' },
  ];

  const logLevelOptions = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Debug', label: 'Debug' },
    { value: 'Trace', label: 'Trace' },
    { value: 'TraceAll', label: 'TraceAll' },
  ];

  return (
    <Form>
      <Grid hasGutter>
        <GridItem span={12}>
          <Card>
            <CardTitle>{t('Configuration')}</CardTitle>
            <CardBody>
              <FormGroup label={t('Management State')} fieldId="management-state">
                <FormSelect
                  id="management-state"
                  value={certManager.spec?.managementState || 'Managed'}
                  onChange={(_event, value) => updateSpec(['managementState'], value)}
                >
                  {managementStateOptions.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup label={t('Log Level')} fieldId="log-level">
                <FormSelect
                  id="log-level"
                  value={certManager.spec?.logLevel || 'Normal'}
                  onChange={(_event, value) => updateSpec(['logLevel'], value)}
                >
                  {logLevelOptions.map((option) => (
                    <FormSelectOption
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={12} md={4}>
          <Card>
            <CardTitle>{t('Controller')}</CardTitle>
            <CardBody>
              <FormGroup label={t('Replicas')} fieldId="controller-replicas">
                <TextInput
                  id="controller-replicas"
                  type="number"
                  value={certManager.spec?.controllerConfig?.replicas || 1}
                  onChange={(_event, value) =>
                    updateSpec(['controllerConfig', 'replicas'], parseInt(value, 10) || 1)
                  }
                />
              </FormGroup>

              <FormGroup label={t('CPU Request')} fieldId="controller-cpu-request">
                <TextInput
                  id="controller-cpu-request"
                  placeholder="e.g., 100m"
                  value={certManager.spec?.controllerConfig?.resources?.requests?.cpu || ''}
                  onChange={(_event, value) =>
                    updateSpec(['controllerConfig', 'resources', 'requests', 'cpu'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('Memory Request')} fieldId="controller-memory-request">
                <TextInput
                  id="controller-memory-request"
                  placeholder="e.g., 128Mi"
                  value={certManager.spec?.controllerConfig?.resources?.requests?.memory || ''}
                  onChange={(_event, value) =>
                    updateSpec(['controllerConfig', 'resources', 'requests', 'memory'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('CPU Limit')} fieldId="controller-cpu-limit">
                <TextInput
                  id="controller-cpu-limit"
                  placeholder="e.g., 500m"
                  value={certManager.spec?.controllerConfig?.resources?.limits?.cpu || ''}
                  onChange={(_event, value) =>
                    updateSpec(['controllerConfig', 'resources', 'limits', 'cpu'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('Memory Limit')} fieldId="controller-memory-limit">
                <TextInput
                  id="controller-memory-limit"
                  placeholder="e.g., 256Mi"
                  value={certManager.spec?.controllerConfig?.resources?.limits?.memory || ''}
                  onChange={(_event, value) =>
                    updateSpec(['controllerConfig', 'resources', 'limits', 'memory'], value)
                  }
                />
              </FormGroup>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={12} md={4}>
          <Card>
            <CardTitle>{t('Webhook')}</CardTitle>
            <CardBody>
              <FormGroup label={t('Replicas')} fieldId="webhook-replicas">
                <TextInput
                  id="webhook-replicas"
                  type="number"
                  value={certManager.spec?.webhookConfig?.replicas || 1}
                  onChange={(_event, value) =>
                    updateSpec(['webhookConfig', 'replicas'], parseInt(value, 10) || 1)
                  }
                />
              </FormGroup>

              <FormGroup label={t('CPU Request')} fieldId="webhook-cpu-request">
                <TextInput
                  id="webhook-cpu-request"
                  placeholder="e.g., 100m"
                  value={certManager.spec?.webhookConfig?.resources?.requests?.cpu || ''}
                  onChange={(_event, value) =>
                    updateSpec(['webhookConfig', 'resources', 'requests', 'cpu'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('Memory Request')} fieldId="webhook-memory-request">
                <TextInput
                  id="webhook-memory-request"
                  placeholder="e.g., 128Mi"
                  value={certManager.spec?.webhookConfig?.resources?.requests?.memory || ''}
                  onChange={(_event, value) =>
                    updateSpec(['webhookConfig', 'resources', 'requests', 'memory'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('CPU Limit')} fieldId="webhook-cpu-limit">
                <TextInput
                  id="webhook-cpu-limit"
                  placeholder="e.g., 500m"
                  value={certManager.spec?.webhookConfig?.resources?.limits?.cpu || ''}
                  onChange={(_event, value) =>
                    updateSpec(['webhookConfig', 'resources', 'limits', 'cpu'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('Memory Limit')} fieldId="webhook-memory-limit">
                <TextInput
                  id="webhook-memory-limit"
                  placeholder="e.g., 256Mi"
                  value={certManager.spec?.webhookConfig?.resources?.limits?.memory || ''}
                  onChange={(_event, value) =>
                    updateSpec(['webhookConfig', 'resources', 'limits', 'memory'], value)
                  }
                />
              </FormGroup>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={12} md={4}>
          <Card>
            <CardTitle>{t('CA Injector')}</CardTitle>
            <CardBody>
              <FormGroup label={t('Replicas')} fieldId="cainjector-replicas">
                <TextInput
                  id="cainjector-replicas"
                  type="number"
                  value={certManager.spec?.cainjectorConfig?.replicas || 1}
                  onChange={(_event, value) =>
                    updateSpec(['cainjectorConfig', 'replicas'], parseInt(value, 10) || 1)
                  }
                />
              </FormGroup>

              <FormGroup label={t('CPU Request')} fieldId="cainjector-cpu-request">
                <TextInput
                  id="cainjector-cpu-request"
                  placeholder="e.g., 100m"
                  value={certManager.spec?.cainjectorConfig?.resources?.requests?.cpu || ''}
                  onChange={(_event, value) =>
                    updateSpec(['cainjectorConfig', 'resources', 'requests', 'cpu'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('Memory Request')} fieldId="cainjector-memory-request">
                <TextInput
                  id="cainjector-memory-request"
                  placeholder="e.g., 128Mi"
                  value={certManager.spec?.cainjectorConfig?.resources?.requests?.memory || ''}
                  onChange={(_event, value) =>
                    updateSpec(['cainjectorConfig', 'resources', 'requests', 'memory'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('CPU Limit')} fieldId="cainjector-cpu-limit">
                <TextInput
                  id="cainjector-cpu-limit"
                  placeholder="e.g., 500m"
                  value={certManager.spec?.cainjectorConfig?.resources?.limits?.cpu || ''}
                  onChange={(_event, value) =>
                    updateSpec(['cainjectorConfig', 'resources', 'limits', 'cpu'], value)
                  }
                />
              </FormGroup>

              <FormGroup label={t('Memory Limit')} fieldId="cainjector-memory-limit">
                <TextInput
                  id="cainjector-memory-limit"
                  placeholder="e.g., 256Mi"
                  value={certManager.spec?.cainjectorConfig?.resources?.limits?.memory || ''}
                  onChange={(_event, value) =>
                    updateSpec(['cainjectorConfig', 'resources', 'limits', 'memory'], value)
                  }
                />
              </FormGroup>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Form>
  );
};

export default CertManagerForm;
