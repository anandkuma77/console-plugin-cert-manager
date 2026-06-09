import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Page,
  PageSection,
  Content,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Button,
  Label,
  EmptyState,
  Title,
  EmptyStateFooter,
  EmptyStateActions,
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
} from '@openshift-console/dynamic-plugin-sdk';
import { ClusterIssuer, ClusterIssuerModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';
import { getIssuerType } from '../../utils/issuer';

export const ClusterIssuerListPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const [sortIndex, setSortIndex] = React.useState(0);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = React.useState('');

  const [clusterIssuers, loaded, loadError] = useK8sWatchResource<ClusterIssuer[]>({
    groupVersionKind: {
      group: ClusterIssuerModel.apiGroup,
      version: ClusterIssuerModel.apiVersion,
      kind: ClusterIssuerModel.kind,
    },
    isList: true,
    namespaced: false,
  });

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: { index: sortIndex, direction: sortDirection },
    onSort: (_event, index, direction) => {
      setSortIndex(index);
      setSortDirection(direction);
    },
    columnIndex,
  });

  const filteredClusterIssuers = React.useMemo(() => {
    if (!clusterIssuers) return [];

    let filtered = clusterIssuers.filter((clusterIssuer) =>
      clusterIssuer.metadata.name?.toLowerCase().includes(filter.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue =
        sortIndex === 0
          ? a.metadata.name || ''
          : sortIndex === 1
            ? getStatusLabel(a.status?.conditions)
            : sortIndex === 2
              ? getIssuerType(a.spec)
              : '';
      const bValue =
        sortIndex === 0
          ? b.metadata.name || ''
          : sortIndex === 1
            ? getStatusLabel(b.status?.conditions)
            : sortIndex === 2
              ? getIssuerType(b.spec)
              : '';

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [clusterIssuers, filter, sortIndex, sortDirection]);

  if (loadError) {
    return (
      <PageSection>
        <EmptyState>
          <Title headingLevel="h2">{t('Error loading cluster issuers')}</Title>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant="light">
        <Content>
          <h1>{t('ClusterIssuers')}</h1>
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
            <ToolbarItem>
              <Button variant="primary" onClick={() => (window.location.href = '/clusterissuers/create')}>
                {t('Create ClusterIssuer')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {loaded && filteredClusterIssuers.length === 0 ? (
          <EmptyState>
            <Title headingLevel="h2">{t('No cluster issuers found')}</Title>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={() => (window.location.href = '/clusterissuers/create')}>
                  {t('Create ClusterIssuer')}
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th sort={getSortParams(0)}>{t('Name')}</Th>
                <Th sort={getSortParams(1)}>{t('Status')}</Th>
                <Th sort={getSortParams(2)}>{t('Type')}</Th>
                <Th>{t('Age')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredClusterIssuers.map((clusterIssuer) => {
                const statusLabel = getStatusLabel(clusterIssuer.status?.conditions);
                const statusColor = getStatusColor(clusterIssuer.status?.conditions);
                const issuerType = getIssuerType(clusterIssuer.spec);

                return (
                  <Tr key={clusterIssuer.metadata.uid}>
                    <Td dataLabel={t('Name')}>
                      <a href={`/clusterissuers/${clusterIssuer.metadata.name}`}>
                        {clusterIssuer.metadata.name}
                      </a>
                    </Td>
                    <Td dataLabel={t('Status')}>
                      <Label color={statusColor}>{statusLabel}</Label>
                    </Td>
                    <Td dataLabel={t('Type')}>{issuerType}</Td>
                    <Td dataLabel={t('Age')}>
                      {formatTimestamp(clusterIssuer.metadata.creationTimestamp)}
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

export default ClusterIssuerListPage;
