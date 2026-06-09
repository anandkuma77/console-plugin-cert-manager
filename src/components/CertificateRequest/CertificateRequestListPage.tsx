import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageSection,
  Content,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Label,
  EmptyState,
  Title,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ThProps,
} from '@patternfly/react-table';
import {
  useK8sWatchResource,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { CertificateRequest, CertificateRequestModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';

export const CertificateRequestListPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const [activeNamespace] = useActiveNamespace();
  const [sortIndex, setSortIndex] = React.useState(0);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = React.useState('');

  const [certificateRequests, loaded, loadError] = useK8sWatchResource<CertificateRequest[]>({
    groupVersionKind: {
      group: CertificateRequestModel.apiGroup,
      version: CertificateRequestModel.apiVersion,
      kind: CertificateRequestModel.kind,
    },
    isList: true,
    namespace: activeNamespace === '#ALL_NS#' ? undefined : activeNamespace,
    namespaced: true,
  });

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: { index: sortIndex, direction: sortDirection },
    onSort: (_event, index, direction) => {
      setSortIndex(index);
      setSortDirection(direction);
    },
    columnIndex,
  });

  const getApprovedStatus = (cr: CertificateRequest): string => {
    const approvedCondition = cr.status?.conditions?.find((c) => c.type === 'Approved');
    if (approvedCondition?.status === 'True') {
      return 'Approved';
    }
    const deniedCondition = cr.status?.conditions?.find((c) => c.type === 'Denied');
    if (deniedCondition?.status === 'True') {
      return 'Denied';
    }
    return 'Pending';
  };

  const filteredCertRequests = React.useMemo(() => {
    if (!certificateRequests) return [];

    let filtered = certificateRequests.filter((cr) =>
      cr.metadata.name?.toLowerCase().includes(filter.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue =
        sortIndex === 0
          ? a.metadata.name || ''
          : sortIndex === 1
            ? a.metadata.namespace || ''
            : sortIndex === 2
              ? getApprovedStatus(a)
              : sortIndex === 3
                ? getStatusLabel(a.status?.conditions)
                : '';
      const bValue =
        sortIndex === 0
          ? b.metadata.name || ''
          : sortIndex === 1
            ? b.metadata.namespace || ''
            : sortIndex === 2
              ? getApprovedStatus(b)
              : sortIndex === 3
                ? getStatusLabel(b.status?.conditions)
                : '';

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [certificateRequests, filter, sortIndex, sortDirection]);

  if (loadError) {
    return (
      <PageSection>
        <EmptyState>
          <Title headingLevel="h2">{t('Error loading certificate requests')}</Title>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant="light">
        <Content>
          <h1>{t('Certificate Requests')}</h1>
        </Content>
      </PageSection>
      <PageSection>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder={t('Filter by name...')}
                value={filter}
                onChange={(_event, value) => setFilter(value)}
                onClear={() => setFilter('')}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {loaded && filteredCertRequests.length === 0 ? (
          <EmptyState>
            <Title headingLevel="h2">{t('No certificate requests found')}</Title>
          </EmptyState>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th sort={getSortParams(0)}>{t('Name')}</Th>
                <Th sort={getSortParams(1)}>{t('Namespace')}</Th>
                <Th sort={getSortParams(2)}>{t('Approved')}</Th>
                <Th sort={getSortParams(3)}>{t('Ready')}</Th>
                <Th>{t('Issuer')}</Th>
                <Th>{t('Age')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCertRequests.map((cr) => {
                const approvedStatus = getApprovedStatus(cr);
                const readyStatus = getStatusLabel(cr.status?.conditions);
                const readyColor = getStatusColor(cr.status?.conditions);
                const approvedColor =
                  approvedStatus === 'Approved'
                    ? 'success'
                    : approvedStatus === 'Denied'
                      ? 'danger'
                      : 'grey';

                return (
                  <Tr key={cr.metadata.uid}>
                    <Td dataLabel={t('Name')}>
                      <a href={`/certificaterequests/${cr.metadata.namespace}/${cr.metadata.name}`}>
                        {cr.metadata.name}
                      </a>
                    </Td>
                    <Td dataLabel={t('Namespace')}>{cr.metadata.namespace}</Td>
                    <Td dataLabel={t('Approved')}>
                      <Label color={approvedColor}>{approvedStatus}</Label>
                    </Td>
                    <Td dataLabel={t('Ready')}>
                      <Label color={readyColor}>{readyStatus}</Label>
                    </Td>
                    <Td dataLabel={t('Issuer')}>
                      {cr.spec.issuerRef.name} ({cr.spec.issuerRef.kind || 'Issuer'})
                    </Td>
                    <Td dataLabel={t('Age')}>
                      {formatTimestamp(cr.metadata.creationTimestamp)}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </PageSection>
    </>
  );
};

export default CertificateRequestListPage;
