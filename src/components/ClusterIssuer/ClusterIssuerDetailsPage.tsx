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
import { ClusterIssuer, ClusterIssuerModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';

const ClusterIssuerDetailsPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const { name } = useParams<{ name: string }>();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const [clusterIssuer, loaded, loadError] = useK8sWatchResource<ClusterIssuer>({
    groupVersionKind: {
      group: ClusterIssuerModel.apiGroup,
      version: ClusterIssuerModel.apiVersion,
      kind: ClusterIssuerModel.kind,
    },
    name,
    namespaced: false,
  });

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

  const handleEdit = () => {
    console.log('Edit cluster issuer:', name);
  };

  const handleDelete = () => {
    console.log('Delete cluster issuer:', name);
  };

  if (loadError) {
    return (
      <PageSection>
        <Content component="h1">{t('Error loading cluster issuer')}</Content>
        <Content>{loadError.message}</Content>
      </PageSection>
    );
  }

  if (!loaded || !clusterIssuer) {
    return (
      <PageSection>
        <Content component="h1">{t('Loading...')}</Content>
      </PageSection>
    );
  }

  const status = getStatusLabel(clusterIssuer.status?.conditions);
  const statusColor = getStatusColor(clusterIssuer.status?.conditions);

  const getIssuerType = (): string => {
    if (clusterIssuer.spec.acme) return 'ACME';
    if (clusterIssuer.spec.ca) return 'CA';
    if (clusterIssuer.spec.vault) return 'Vault';
    if (clusterIssuer.spec.venafi) return 'Venafi';
    if (clusterIssuer.spec.selfSigned) return 'SelfSigned';
    return 'Unknown';
  };

  const issuerType = getIssuerType();

  const renderTypeSpecificConfig = () => {
    if (clusterIssuer.spec.acme) {
      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('ACME Server')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.acme.server || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Email')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.acme.email || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Private Key Secret')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.acme.privateKeySecretRef?.name || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Skip TLS Verify')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.acme.skipTLSVerify ? 'true' : 'false'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {clusterIssuer.status?.acme?.uri && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ACME URI')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterIssuer.status.acme.uri}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {clusterIssuer.status?.acme?.lastRegisteredEmail && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Last Registered Email')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterIssuer.status.acme.lastRegisteredEmail}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      );
    }

    if (clusterIssuer.spec.ca) {
      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('CA Secret Name')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.ca.secretName || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {clusterIssuer.spec.ca.crlDistributionPoints && clusterIssuer.spec.ca.crlDistributionPoints.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('CRL Distribution Points')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterIssuer.spec.ca.crlDistributionPoints.join(', ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {clusterIssuer.spec.ca.ocspServers && clusterIssuer.spec.ca.ocspServers.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('OCSP Servers')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterIssuer.spec.ca.ocspServers.join(', ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      );
    }

    if (clusterIssuer.spec.vault) {
      const authType = clusterIssuer.spec.vault.auth.tokenSecretRef
        ? 'Token'
        : clusterIssuer.spec.vault.auth.appRole
        ? 'AppRole'
        : clusterIssuer.spec.vault.auth.kubernetes
        ? 'Kubernetes'
        : 'Unknown';

      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Vault Server')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.vault.server || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Path')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.vault.path || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Auth Type')}</DescriptionListTerm>
            <DescriptionListDescription>{authType}</DescriptionListDescription>
          </DescriptionListGroup>

          {clusterIssuer.spec.vault.namespace && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Vault Namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterIssuer.spec.vault.namespace}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      );
    }

    if (clusterIssuer.spec.venafi) {
      return (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Zone')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterIssuer.spec.venafi.zone || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          {clusterIssuer.spec.venafi.tpp && (
            <>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('TPP URL')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {clusterIssuer.spec.venafi.tpp.url}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('TPP Credentials Secret')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {clusterIssuer.spec.venafi.tpp.credentialsRef.name}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}

          {clusterIssuer.spec.venafi.cloud && (
            <>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Cloud API Token Secret')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {clusterIssuer.spec.venafi.cloud.apiTokenSecretRef.name}
                </DescriptionListDescription>
              </DescriptionListGroup>

              {clusterIssuer.spec.venafi.cloud.url && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Cloud URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {clusterIssuer.spec.venafi.cloud.url}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </>
          )}
        </>
      );
    }

    if (clusterIssuer.spec.selfSigned) {
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
          {clusterIssuer.metadata.name}
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
              <Content component="h2">{t('ClusterIssuer Details')}</Content>
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
                  {clusterIssuer.status?.conditions?.map((condition, index) => (
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
                value={JSON.stringify(clusterIssuer, null, 2)}
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

export default ClusterIssuerDetailsPage;
