import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageSection,
  Content,
  Form,
  FormGroup,
  TextInput,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Button,
  ActionGroup,
  MenuToggleElement,
  TextArea,
} from '@patternfly/react-core';
import {
  k8sCreate,
  k8sUpdate,
  k8sGet,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { CertificateModel } from '../../models';
import { Certificate } from '../../types';

const CertificateForm: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const { name } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const [activeNamespace] = useActiveNamespace();

  const isEditMode = !!name;

  // Form state
  const [formName, setFormName] = useState('');
  const [namespace, setNamespace] = useState(activeNamespace || 'default');
  const [secretName, setSecretName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [dnsNames, setDnsNames] = useState('');
  const [issuerKind, setIssuerKind] = useState('Issuer');
  const [issuerName, setIssuerName] = useState('');
  const [duration, setDuration] = useState('2160h');
  const [renewBefore, setRenewBefore] = useState('360h');

  // UI state
  const [issuerKindOpen, setIssuerKindOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && name) {
      loadCertificate();
    }
  }, [isEditMode, name]);

  const loadCertificate = async () => {
    try {
      setIsLoading(true);
      const cert = await k8sGet<Certificate>({
        model: CertificateModel,
        name: name!,
        ns: activeNamespace,
      });

      setFormName(cert.metadata?.name || '');
      setNamespace(cert.metadata?.namespace || activeNamespace || 'default');
      setSecretName(cert.spec?.secretName || '');
      setCommonName(cert.spec?.commonName || '');
      setDnsNames(cert.spec?.dnsNames?.join('\n') || '');
      setIssuerKind(cert.spec?.issuerRef?.kind || 'Issuer');
      setIssuerName(cert.spec?.issuerRef?.name || '');
      setDuration(cert.spec?.duration || '2160h');
      setRenewBefore(cert.spec?.renewBefore || '360h');
    } catch (error) {
      console.error('Error loading certificate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formName.trim()) {
      newErrors.name = t('Name is required');
    }
    if (!namespace.trim()) {
      newErrors.namespace = t('Namespace is required');
    }
    if (!secretName.trim()) {
      newErrors.secretName = t('Secret name is required');
    }
    if (!issuerName.trim()) {
      newErrors.issuerName = t('Issuer name is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const dnsNamesArray = dnsNames
      .split('\n')
      .map((dns) => dns.trim())
      .filter((dns) => dns.length > 0);

    const certificate: Certificate = {
      apiVersion: 'cert-manager.io/v1',
      kind: 'Certificate',
      metadata: {
        name: formName,
        namespace,
      },
      spec: {
        secretName,
        issuerRef: {
          name: issuerName,
          kind: issuerKind,
        },
        ...(commonName && { commonName }),
        ...(dnsNamesArray.length > 0 && { dnsNames: dnsNamesArray }),
        ...(duration && { duration }),
        ...(renewBefore && { renewBefore }),
      },
    };

    try {
      setIsLoading(true);
      let result: Certificate;

      if (isEditMode) {
        result = await k8sUpdate({
          model: CertificateModel,
          data: certificate,
          ns: namespace,
          name: formName,
        });
      } else {
        result = await k8sCreate({
          model: CertificateModel,
          data: certificate,
        });
      }

      // Navigate to detail page
      navigate(
        `/k8s/ns/${result.metadata?.namespace}/${CertificateModel.plural}/${result.metadata?.name}`,
      );
    } catch (error) {
      console.error('Error saving certificate:', error);
      setErrors({
        submit: t('Failed to save certificate: {{error}}', {
          error: String(error),
        }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const issuerKindOptions = [
    { value: 'Issuer', label: 'Issuer' },
    { value: 'ClusterIssuer', label: 'ClusterIssuer' },
  ];

  return (
    <PageSection>
      <Content component="h1">
        {isEditMode ? t('Edit Certificate') : t('Create Certificate')}
      </Content>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          label={t('Name')}
          isRequired
          fieldId="name"
          validated={errors.name ? 'error' : 'default'}
          helperTextInvalid={errors.name}
        >
          <TextInput
            isRequired
            type="text"
            id="name"
            name="name"
            value={formName}
            onChange={(_event, value) => setFormName(value)}
            validated={errors.name ? 'error' : 'default'}
            isDisabled={isEditMode}
          />
        </FormGroup>

        <FormGroup
          label={t('Namespace')}
          isRequired
          fieldId="namespace"
          validated={errors.namespace ? 'error' : 'default'}
          helperTextInvalid={errors.namespace}
        >
          <TextInput
            isRequired
            type="text"
            id="namespace"
            name="namespace"
            value={namespace}
            onChange={(_event, value) => setNamespace(value)}
            validated={errors.namespace ? 'error' : 'default'}
            isDisabled={isEditMode}
          />
        </FormGroup>

        <FormGroup
          label={t('Secret Name')}
          isRequired
          fieldId="secretName"
          validated={errors.secretName ? 'error' : 'default'}
          helperTextInvalid={errors.secretName}
          helperText={t('Name of the secret to store the certificate')}
        >
          <TextInput
            isRequired
            type="text"
            id="secretName"
            name="secretName"
            value={secretName}
            onChange={(_event, value) => setSecretName(value)}
            validated={errors.secretName ? 'error' : 'default'}
          />
        </FormGroup>

        <FormGroup label={t('Common Name')} fieldId="commonName">
          <TextInput
            type="text"
            id="commonName"
            name="commonName"
            value={commonName}
            onChange={(_event, value) => setCommonName(value)}
          />
        </FormGroup>

        <FormGroup
          label={t('DNS Names')}
          fieldId="dnsNames"
          helperText={t('One DNS name per line')}
        >
          <TextArea
            id="dnsNames"
            name="dnsNames"
            value={dnsNames}
            onChange={(_event, value) => setDnsNames(value)}
            rows={4}
          />
        </FormGroup>

        <FormGroup
          label={t('Issuer Kind')}
          isRequired
          fieldId="issuerKind"
        >
          <Select
            id="issuerKind"
            isOpen={issuerKindOpen}
            selected={issuerKind}
            onSelect={(_event, value) => {
              setIssuerKind(value as string);
              setIssuerKindOpen(false);
            }}
            onOpenChange={(isOpen) => setIssuerKindOpen(isOpen)}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIssuerKindOpen(!issuerKindOpen)}
                isExpanded={issuerKindOpen}
              >
                {issuerKind}
              </MenuToggle>
            )}
          >
            <SelectList>
              {issuerKindOptions.map((option) => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </FormGroup>

        <FormGroup
          label={t('Issuer Name')}
          isRequired
          fieldId="issuerName"
          validated={errors.issuerName ? 'error' : 'default'}
          helperTextInvalid={errors.issuerName}
        >
          <TextInput
            isRequired
            type="text"
            id="issuerName"
            name="issuerName"
            value={issuerName}
            onChange={(_event, value) => setIssuerName(value)}
            validated={errors.issuerName ? 'error' : 'default'}
          />
        </FormGroup>

        <FormGroup
          label={t('Duration')}
          fieldId="duration"
          helperText={t('Certificate lifetime (e.g., 2160h, 90d)')}
        >
          <TextInput
            type="text"
            id="duration"
            name="duration"
            value={duration}
            onChange={(_event, value) => setDuration(value)}
          />
        </FormGroup>

        <FormGroup
          label={t('Renew Before')}
          fieldId="renewBefore"
          helperText={t('Time before expiry to renew (e.g., 360h, 15d)')}
        >
          <TextInput
            type="text"
            id="renewBefore"
            name="renewBefore"
            value={renewBefore}
            onChange={(_event, value) => setRenewBefore(value)}
          />
        </FormGroup>

        {errors.submit && (
          <FormGroup fieldId="submit-error">
            <Content component="p" style={{ color: 'var(--pf-v6-global--danger-color--100)' }}>
              {errors.submit}
            </Content>
          </FormGroup>
        )}

        <ActionGroup>
          <Button
            variant="primary"
            type="submit"
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            {isEditMode ? t('Save') : t('Create')}
          </Button>
          <Button variant="link" onClick={handleCancel}>
            {t('Cancel')}
          </Button>
        </ActionGroup>
      </Form>
    </PageSection>
  );
};

export default CertificateForm;
