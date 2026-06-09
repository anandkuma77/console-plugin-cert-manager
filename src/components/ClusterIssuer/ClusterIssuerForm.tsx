import * as React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  ActionGroup,
  Button,
} from '@patternfly/react-core';
import { k8sCreate, k8sUpdate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';

export interface ClusterIssuerFormProps {
  clusterIssuer?: K8sResourceCommon;
  onCancel: () => void;
  onSuccess: () => void;
}

type IssuerType = 'ACME' | 'CA' | 'Vault' | 'Venafi' | 'SelfSigned';

const ClusterIssuerForm: React.FC<ClusterIssuerFormProps> = ({
  clusterIssuer,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const isEdit = !!clusterIssuer;

  const [name, setName] = React.useState(clusterIssuer?.metadata?.name || '');
  const [issuerType, setIssuerType] = React.useState<IssuerType>(
    getIssuerType(clusterIssuer) || 'ACME',
  );

  const [acmeServer, setAcmeServer] = React.useState(
    clusterIssuer?.spec?.acme?.server || '',
  );
  const [acmeEmail, setAcmeEmail] = React.useState(
    clusterIssuer?.spec?.acme?.email || '',
  );
  const [acmePrivateKeySecretRef, setAcmePrivateKeySecretRef] = React.useState(
    clusterIssuer?.spec?.acme?.privateKeySecretRef?.name || '',
  );

  const [caSecretName, setCaSecretName] = React.useState(
    clusterIssuer?.spec?.ca?.secretName || '',
  );

  const [vaultServer, setVaultServer] = React.useState(
    clusterIssuer?.spec?.vault?.server || '',
  );
  const [vaultPath, setVaultPath] = React.useState(
    clusterIssuer?.spec?.vault?.path || '',
  );
  const [vaultCaBundle, setVaultCaBundle] = React.useState(
    clusterIssuer?.spec?.vault?.caBundle || '',
  );

  const [venafiZone, setVenafiZone] = React.useState(
    clusterIssuer?.spec?.venafi?.zone || '',
  );
  const [venafiApiKeySecretRef, setVenafiApiKeySecretRef] = React.useState(
    clusterIssuer?.spec?.venafi?.cloud?.apiTokenSecretRef?.name || '',
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  function getIssuerType(issuerObj?: K8sResourceCommon): IssuerType | null {
    if (!issuerObj?.spec) return null;
    if (issuerObj.spec.acme) return 'ACME';
    if (issuerObj.spec.ca) return 'CA';
    if (issuerObj.spec.vault) return 'Vault';
    if (issuerObj.spec.venafi) return 'Venafi';
    if (issuerObj.spec.selfSigned) return 'SelfSigned';
    return null;
  }

  const buildIssuerSpec = () => {
    const spec: any = {};

    switch (issuerType) {
      case 'ACME':
        spec.acme = {
          server: acmeServer,
          email: acmeEmail,
          privateKeySecretRef: {
            name: acmePrivateKeySecretRef,
          },
        };
        break;
      case 'CA':
        spec.ca = {
          secretName: caSecretName,
        };
        break;
      case 'Vault':
        spec.vault = {
          server: vaultServer,
          path: vaultPath,
          ...(vaultCaBundle && { caBundle: vaultCaBundle }),
        };
        break;
      case 'Venafi':
        spec.venafi = {
          zone: venafiZone,
          cloud: {
            apiTokenSecretRef: {
              name: venafiApiKeySecretRef,
            },
          },
        };
        break;
      case 'SelfSigned':
        spec.selfSigned = {};
        break;
    }

    return spec;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const clusterIssuerResource: K8sResourceCommon = {
        apiVersion: 'cert-manager.io/v1',
        kind: 'ClusterIssuer',
        metadata: {
          name,
        },
        spec: buildIssuerSpec(),
      };

      if (isEdit) {
        await k8sUpdate({
          model: {
            apiVersion: 'cert-manager.io/v1',
            apiGroup: 'cert-manager.io',
            kind: 'ClusterIssuer',
            plural: 'clusterissuers',
            namespaced: false,
          },
          data: {
            ...clusterIssuerResource,
            metadata: {
              ...clusterIssuerResource.metadata,
              resourceVersion: clusterIssuer.metadata?.resourceVersion,
            },
          },
        });
      } else {
        await k8sCreate({
          model: {
            apiVersion: 'cert-manager.io/v1',
            apiGroup: 'cert-manager.io',
            kind: 'ClusterIssuer',
            plural: 'clusterissuers',
            namespaced: false,
          },
          data: clusterIssuerResource,
        });
      }

      onSuccess();
    } catch (err) {
      setError(err.message || t('Failed to save ClusterIssuer'));
      setIsSubmitting(false);
    }
  };

  const issuerTypeOptions = [
    { value: 'ACME', label: 'ACME', disabled: false },
    { value: 'CA', label: 'CA', disabled: false },
    { value: 'Vault', label: 'Vault', disabled: false },
    { value: 'Venafi', label: 'Venafi', disabled: false },
    { value: 'SelfSigned', label: t('Self-Signed'), disabled: false },
  ];

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup label={t('Name')} isRequired fieldId="clusterissuer-name">
        <TextInput
          isRequired
          type="text"
          id="clusterissuer-name"
          value={name}
          onChange={(_event, value) => setName(value)}
          isDisabled={isEdit}
        />
      </FormGroup>

      <FormGroup label={t('Issuer Type')} isRequired fieldId="clusterissuer-type">
        <FormSelect
          value={issuerType}
          onChange={(_event, value) => setIssuerType(value as IssuerType)}
          id="clusterissuer-type"
          isDisabled={isEdit}
        >
          {issuerTypeOptions.map((option) => (
            <FormSelectOption
              key={option.value}
              value={option.value}
              label={option.label}
            />
          ))}
        </FormSelect>
      </FormGroup>

      {issuerType === 'ACME' && (
        <>
          <FormGroup label={t('Server')} isRequired fieldId="acme-server">
            <TextInput
              isRequired
              type="text"
              id="acme-server"
              value={acmeServer}
              onChange={(_event, value) => setAcmeServer(value)}
              placeholder="https://acme-v02.api.letsencrypt.org/directory"
            />
          </FormGroup>

          <FormGroup label={t('Email')} isRequired fieldId="acme-email">
            <TextInput
              isRequired
              type="email"
              id="acme-email"
              value={acmeEmail}
              onChange={(_event, value) => setAcmeEmail(value)}
              placeholder="admin@example.com"
            />
          </FormGroup>

          <FormGroup
            label={t('Private Key Secret')}
            isRequired
            fieldId="acme-private-key-secret"
          >
            <TextInput
              isRequired
              type="text"
              id="acme-private-key-secret"
              value={acmePrivateKeySecretRef}
              onChange={(_event, value) => setAcmePrivateKeySecretRef(value)}
              placeholder="letsencrypt-private-key"
            />
          </FormGroup>
        </>
      )}

      {issuerType === 'CA' && (
        <FormGroup
          label={t('Secret Name')}
          isRequired
          fieldId="ca-secret-name"
        >
          <TextInput
            isRequired
            type="text"
            id="ca-secret-name"
            value={caSecretName}
            onChange={(_event, value) => setCaSecretName(value)}
            placeholder="ca-key-pair"
          />
        </FormGroup>
      )}

      {issuerType === 'Vault' && (
        <>
          <FormGroup label={t('Server')} isRequired fieldId="vault-server">
            <TextInput
              isRequired
              type="text"
              id="vault-server"
              value={vaultServer}
              onChange={(_event, value) => setVaultServer(value)}
              placeholder="https://vault.example.com:8200"
            />
          </FormGroup>

          <FormGroup label={t('Path')} isRequired fieldId="vault-path">
            <TextInput
              isRequired
              type="text"
              id="vault-path"
              value={vaultPath}
              onChange={(_event, value) => setVaultPath(value)}
              placeholder="pki/sign/example-dot-com"
            />
          </FormGroup>

          <FormGroup label={t('CA Bundle')} fieldId="vault-ca-bundle">
            <TextInput
              type="text"
              id="vault-ca-bundle"
              value={vaultCaBundle}
              onChange={(_event, value) => setVaultCaBundle(value)}
            />
          </FormGroup>
        </>
      )}

      {issuerType === 'Venafi' && (
        <>
          <FormGroup label={t('Zone')} isRequired fieldId="venafi-zone">
            <TextInput
              isRequired
              type="text"
              id="venafi-zone"
              value={venafiZone}
              onChange={(_event, value) => setVenafiZone(value)}
              placeholder="DevOps\\Default"
            />
          </FormGroup>

          <FormGroup
            label={t('API Key Secret')}
            isRequired
            fieldId="venafi-api-key-secret"
          >
            <TextInput
              isRequired
              type="text"
              id="venafi-api-key-secret"
              value={venafiApiKeySecretRef}
              onChange={(_event, value) => setVenafiApiKeySecretRef(value)}
              placeholder="venafi-api-token"
            />
          </FormGroup>
        </>
      )}

      {error && (
        <div className="pf-v5-c-alert pf-m-danger pf-m-inline">
          <div className="pf-v5-c-alert__icon">
            <i className="fas fa-exclamation-circle" />
          </div>
          <h4 className="pf-v5-c-alert__title">{error}</h4>
        </div>
      )}

      <ActionGroup>
        <Button
          variant="primary"
          type="submit"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isEdit ? t('Update') : t('Create')}
        </Button>
        <Button variant="link" onClick={onCancel}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </Form>
  );
};

export default ClusterIssuerForm;
