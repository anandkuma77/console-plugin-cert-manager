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
  EmptyStateHeader,
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
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Issuer, IssuerModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';
import { getIssuerType } from '../../utils/issuer';

export const IssuerListPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const [activeNamespace] = useActiveNamespace();
  const [sortIndex, setSortIndex] = React.useState(0);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = React.useState('');

  const [issuers, loaded, loadError] = useK8sWatchResource<Issuer[]>({
    groupVersionKind: {
      group: IssuerModel.apiGroup,
      version: IssuerModel.apiVersion,
      kind: IssuerModel.kind,
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

  const filteredIssuers = React.useMemo(() => {
    if (!issuers) return [];

    let filtered = issuers.filter((issuer) =>
      issuer.metadata.name?.toLowerCase().includes(filter.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue =
        sortIndex === 0
          ? a.metadata.name || ''
          : sortIndex === 1
            ? a.metadata.namespace || ''
            : sortIndex === 2
              ? getStatusLabel(a.status?.conditions)
              : sortIndex === 3
                ? getIssuerType(a.spec)
                : '';
      const bValue =
        sortIndex === 0
          ? b.metadata.name || ''
          : sortIndex === 1
            ? b.metadata.namespace || ''
            : sortIndex === 2
              ? getStatusLabel(b.status?.conditions)
              : sortIndex === 3
                ? getIssuerType(b.spec)
                : '';

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [issuers, filter, sortIndex, sortDirection]);

  if (loadError) {
    return (
      <PageSection>
        <EmptyState>
          <EmptyStateHeader titleText={t('Error loading issuers')} headingLevel="h2" />
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant="light">
        <Content>
          <h1>{t('Issuers')}</h1>
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
              <Button variant="primary" onClick={() => (window.location.href = '/issuers/create')}>
                {t('Create Issuer')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {loaded && filteredIssuers.length === 0 ? (
          <EmptyState>
            <EmptyStateHeader titleText={t('No issuers found')} headingLevel="h2" />
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={() => (window.location.href = '/issuers/create')}>
                  {t('Create Issuer')}
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th sort={getSortParams(0)}>{t('Name')}</Th>
                <Th sort={getSortParams(1)}>{t('Namespace')}</Th>
                <Th sort={getSortParams(2)}>{t('Status')}</Th>
                <Th sort={getSortParams(3)}>{t('Type')}</Th>
                <Th>{t('Age')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredIssuers.map((issuer) => {
                const statusLabel = getStatusLabel(issuer.status?.conditions);
                const statusColor = getStatusColor(issuer.status?.conditions);
                const issuerType = getIssuerType(issuer.spec);

                return (
                  <Tr key={issuer.metadata.uid}>
                    <Td dataLabel={t('Name')}>
                      <a href={`/issuers/${issuer.metadata.namespace}/${issuer.metadata.name}`}>
                        {issuer.metadata.name}
                      </a>
                    </Td>
                    <Td dataLabel={t('Namespace')}>{issuer.metadata.namespace}</Td>
                    <Td dataLabel={t('Status')}>
                      <Label color={statusColor}>{statusLabel}</Label>
                    </Td>
                    <Td dataLabel={t('Type')}>{issuerType}</Td>
                    <Td dataLabel={t('Age')}>
                      {formatTimestamp(issuer.metadata.creationTimestamp)}
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

export default IssuerListPage;
