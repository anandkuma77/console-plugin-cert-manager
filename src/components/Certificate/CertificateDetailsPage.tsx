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
import { Certificate, CertificateModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';

const CertificateDetailsPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const { ns, name } = useParams<{ ns: string; name: string }>();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const [certificate, loaded, loadError] = useK8sWatchResource<Certificate>({
    groupVersionKind: {
      group: CertificateModel.apiGroup,
      version: CertificateModel.apiVersion,
      kind: CertificateModel.kind,
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
    console.log('Edit certificate:', name);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete certificate:', name);
  };

  if (loadError) {
    return (
      <PageSection>
        <Content component="h1">{t('Error loading certificate')}</Content>
        <Content>{loadError.message}</Content>
      </PageSection>
    );
  }

  if (!loaded || !certificate) {
    return (
      <PageSection>
        <Content component="h1">{t('Loading...')}</Content>
      </PageSection>
    );
  }

  const status = getStatusLabel(certificate);
  const statusColor = getStatusColor(certificate);

  return (
    <>
      <PageSection variant="light">
        <Content component="h1">
          {certificate.metadata.name}
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
              <Content component="h2">{t('Certificate Details')}</Content>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Secret Name')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificate.spec.secretName || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Issuer Reference')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificate.spec.issuerRef
                      ? `${certificate.spec.issuerRef.kind}/${certificate.spec.issuerRef.name}`
                      : '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Common Name')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificate.spec.commonName || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('DNS Names')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificate.spec.dnsNames?.join(', ') || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Duration')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificate.spec.duration || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Renew Before')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificate.spec.renewBefore || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
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
                  {certificate.status?.conditions?.map((condition, index) => (
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
                value={JSON.stringify(certificate, null, 2)}
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

export default CertificateDetailsPage;
