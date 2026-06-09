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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { CertificateRequest, CertificateRequestModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';

const CertificateRequestDetailsPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const { ns, name } = useParams<{ ns: string; name: string }>();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const [certificateRequest, loaded, loadError] = useK8sWatchResource<CertificateRequest>({
    groupVersionKind: {
      group: CertificateRequestModel.apiGroup,
      version: CertificateRequestModel.apiVersion,
      kind: CertificateRequestModel.kind,
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

  if (loadError) {
    return (
      <PageSection>
        <Content component="h1">{t('Error loading certificate request')}</Content>
        <Content>{loadError.message}</Content>
      </PageSection>
    );
  }

  if (!loaded || !certificateRequest) {
    return (
      <PageSection>
        <Content component="h1">{t('Loading...')}</Content>
      </PageSection>
    );
  }

  const readyStatus = getStatusLabel(certificateRequest.status?.conditions);
  const readyColor = getStatusColor(certificateRequest.status?.conditions);

  const getApprovedStatus = (): string => {
    const approvedCondition = certificateRequest.status?.conditions?.find(
      (c) => c.type === 'Approved',
    );
    if (approvedCondition?.status === 'True') {
      return 'Approved';
    }
    const deniedCondition = certificateRequest.status?.conditions?.find(
      (c) => c.type === 'Denied',
    );
    if (deniedCondition?.status === 'True') {
      return 'Denied';
    }
    return 'Pending';
  };

  const approvedStatus = getApprovedStatus();
  const approvedColor =
    approvedStatus === 'Approved' ? 'success' : approvedStatus === 'Denied' ? 'danger' : 'grey';

  return (
    <>
      <PageSection variant="light">
        <Content component="h1">
          {certificateRequest.metadata.name}
          <Label color={readyColor} style={{ marginLeft: '16px' }}>
            {readyStatus}
          </Label>
          <Label color={approvedColor} style={{ marginLeft: '8px' }}>
            {approvedStatus}
          </Label>
        </Content>
      </PageSection>

      <PageSection>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
          <Tab eventKey={0} title={<TabTitleText>{t('Overview')}</TabTitleText>}>
            <PageSection>
              <Content component="h2">{t('Certificate Request Details')}</Content>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Issuer Reference')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.issuerRef
                      ? `${certificateRequest.spec.issuerRef.kind || 'Issuer'}/${certificateRequest.spec.issuerRef.name}`
                      : '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Duration')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.duration || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Is CA')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.isCA ? 'Yes' : 'No'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Usages')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.usages?.join(', ') || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Username')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.username || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('UID')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.uid || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Groups')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {certificateRequest.spec.groups?.join(', ') || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                {certificateRequest.status?.certificate && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Certificate')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <textarea
                        readOnly
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          padding: '8px',
                          border: '1px solid #d2d2d2',
                          borderRadius: '4px',
                        }}
                        value={certificateRequest.status.certificate}
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}

                {certificateRequest.status?.ca && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('CA Certificate')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <textarea
                        readOnly
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          padding: '8px',
                          border: '1px solid #d2d2d2',
                          borderRadius: '4px',
                        }}
                        value={certificateRequest.status.ca}
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}

                {certificateRequest.status?.failureTime && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Failure Time')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimestamp(certificateRequest.status.failureTime)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
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
                  {certificateRequest.status?.conditions?.map((condition, index) => (
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
                value={JSON.stringify(certificateRequest, null, 2)}
              />
            </PageSection>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export default CertificateRequestDetailsPage;
