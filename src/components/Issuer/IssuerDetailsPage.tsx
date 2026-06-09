import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageSection,
  Content,
  Tabs,
  Tab,
  TabTitleText,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  Button,
  ActionList,
  ActionListItem,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Issuer, IssuerModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';

const IssuerDetailsPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const { ns, name } = useParams<{ ns: string; name: string }>();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const [issuer, loaded, loadError] = useK8sWatchResource<Issuer>({
    groupVersionKind: {
      group: IssuerModel.apiGroup,
      version: IssuerModel.apiVersion,
      kind: IssuerModel.kind,
    },
    name,
    namespace: ns,
  });

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit issuer:', name);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete issuer:', name);
  };

  if (loadError) {
    return (
      <PageSection>
        <Content component="h1">{t('Error loading issuer')}</Content>
        <Content>{loadError.message}</Content>
      </PageSection>
    );
  }

  if (!loaded || !issuer) {
    return (
      <PageSection>
        <Content component="h1">{t('Loading...')}</Content>
      </PageSection>
    );
  }

  const status = getStatusLabel(issuer.status?.conditions);
  const statusColor = getStatusColor(issuer.status?.conditions);

  // Determine issuer type
  const getIssuerType = (): string => {
    if (issuer.spec.acme) return 'ACME';
    if (issuer.spec.ca) return 'CA';
    if (issuer.spec.vault) return 'Vault';
    if (issuer.spec.venafi) return 'Venafi';
    if (issuer.spec.selfSigned) return 'SelfSigned';
    return 'Unknown';
  };

  const issuerType = getIssuerType();

  // Render type-specific configuration
  const renderTypeSpecificConfig = () => {
    if (issuer.spec.acme) {
      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('ACME Server')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.acme.server || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Email')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.acme.email || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Private Key Secret')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.acme.privateKeySecretRef?.name || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Skip TLS Verify')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.acme.skipTLSVerify ? 'true' : 'false'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {issuer.status?.acme?.uri && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ACME URI')}</DescriptionListTerm>
              <DescriptionListDescription>
                {issuer.status.acme.uri}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {issuer.status?.acme?.lastRegisteredEmail && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Last Registered Email')}</DescriptionListTerm>
              <DescriptionListDescription>
                {issuer.status.acme.lastRegisteredEmail}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      );
    }

    if (issuer.spec.ca) {
      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('CA Secret Name')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.ca.secretName || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {issuer.spec.ca.crlDistributionPoints && issuer.spec.ca.crlDistributionPoints.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('CRL Distribution Points')}</DescriptionListTerm>
              <DescriptionListDescription>
                {issuer.spec.ca.crlDistributionPoints.join(', ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {issuer.spec.ca.ocspServers && issuer.spec.ca.ocspServers.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('OCSP Servers')}</DescriptionListTerm>
              <DescriptionListDescription>
                {issuer.spec.ca.ocspServers.join(', ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      );
    }

    if (issuer.spec.vault) {
      const authType = issuer.spec.vault.auth.tokenSecretRef
        ? 'Token'
        : issuer.spec.vault.auth.appRole
        ? 'AppRole'
        : issuer.spec.vault.auth.kubernetes
        ? 'Kubernetes'
        : 'Unknown';

      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Vault Server')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.vault.server || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Path')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.vault.path || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Auth Type')}</DescriptionListTerm>
            <DescriptionListDescription>{authType}</DescriptionListDescription>
          </DescriptionListGroup>

          {issuer.spec.vault.namespace && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Vault Namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                {issuer.spec.vault.namespace}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      );
    }

    if (issuer.spec.venafi) {
      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Zone')}</DescriptionListTerm>
            <DescriptionListDescription>
              {issuer.spec.venafi.zone || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {issuer.spec.venafi.tpp && (
            <>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('TPP URL')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {issuer.spec.venafi.tpp.url}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('TPP Credentials Secret')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {issuer.spec.venafi.tpp.credentialsRef.name}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}

          {issuer.spec.venafi.cloud && (
            <>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Cloud API Token Secret')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {issuer.spec.venafi.cloud.apiTokenSecretRef.name}
                </DescriptionListDescription>
              </DescriptionListGroup>

              {issuer.spec.venafi.cloud.url && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Cloud URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {issuer.spec.venafi.cloud.url}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </>
          )}
        </>
      );
    }

    if (issuer.spec.selfSigned) {
      return (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Configuration')}</DescriptionListTerm>
          <DescriptionListDescription>
            {t('Self-signed issuer (no additional configuration)')}
          </DescriptionListDescription>
        </DescriptionListGroup>
      );
    }

    return null;
  };

  return (
    <>
      <PageSection variant="light">
        <Content component="h1">
          {issuer.metadata.name}
          <Label color={statusColor} style={{ marginLeft: '16px' }}>
            {status}
          </Label>
        </Content>
        <ActionList>
          <ActionListItem>
            <Button variant="primary" onClick={handleEdit}>
              {t('Edit')}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button variant="danger" onClick={handleDelete}>
              {t('Delete')}
            </Button>
          </ActionListItem>
        </ActionList>
      </PageSection>

      <PageSection>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
          <Tab eventKey={0} title={<TabTitleText>{t('Overview')}</TabTitleText>}>
            <PageSection>
              <Content component="h2">{t('Issuer Details')}</Content>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Issuer Type')}</DescriptionListTerm>
                  <DescriptionListDescription>{issuerType}</DescriptionListDescription>
                </DescriptionListGroup>

                {renderTypeSpecificConfig()}
              </DescriptionList>

              <Content component="h2" style={{ marginTop: '24px' }}>
                {t('Conditions')}
              </Content>
              <Table aria-label={t('Conditions table')} variant="compact">
                <Thead>
                  <Tr>
                    <Th>{t('Type')}</Th>
                    <Th>{t('Status')}</Th>
                    <Th>{t('Reason')}</Th>
                    <Th>{t('Message')}</Th>
                    <Th>{t('Last Transition Time')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {issuer.status?.conditions?.map((condition, index) => (
                    <Tr key={index}>
                      <Td dataLabel={t('Type')}>{condition.type}</Td>
                      <Td dataLabel={t('Status')}>{condition.status}</Td>
                      <Td dataLabel={t('Reason')}>{condition.reason || '-'}</Td>
                      <Td dataLabel={t('Message')}>{condition.message || '-'}</Td>
                      <Td dataLabel={t('Last Transition Time')}>
                        {formatTimestamp(condition.lastTransitionTime)}
                      </Td>
                    </Tr>
                  )) || (
                    <Tr>
                      <Td colSpan={5}>{t('No conditions available')}</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </PageSection>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>{t('YAML')}</TabTitleText>}>
            <PageSection>
              <textarea
                readOnly
                style={{
                  width: '100%',
                  height: '600px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: '12px',
                  border: '1px solid #d2d2d2',
                  borderRadius: '4px',
                }}
                value={JSON.stringify(issuer, null, 2)}
              />
            </PageSection>
          </Tab>

          <Tab eventKey={2} title={<TabTitleText>{t('Events')}</TabTitleText>}>
            <PageSection>
              <Content>{t('Events will be displayed here')}</Content>
            </PageSection>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export default IssuerDetailsPage;
