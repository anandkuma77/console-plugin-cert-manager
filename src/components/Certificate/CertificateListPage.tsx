import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageSection,
  Content,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Button,
  Label,
  EmptyState,
  EmptyStateFooter,
  EmptyStateActions,
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
import { Certificate, CertificateModel } from '../../types';
import { getStatusLabel, getStatusColor, formatTimestamp } from '../../utils/conditions';

export const CertificateListPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const [activeNamespace] = useActiveNamespace();
  const [sortIndex, setSortIndex] = React.useState(0);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = React.useState('');

  const [certificates, loaded, loadError] = useK8sWatchResource<Certificate[]>({
    groupVersionKind: {
      group: CertificateModel.apiGroup,
      version: CertificateModel.apiVersion,
      kind: CertificateModel.kind,
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

  const filteredCerts = React.useMemo(() => {
    if (!certificates) return [];

    let filtered = certificates.filter((cert) =>
      cert.metadata.name?.toLowerCase().includes(filter.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue =
        sortIndex === 0
          ? a.metadata.name || ''
          : sortIndex === 1
            ? a.metadata.namespace || ''
            : sortIndex === 2
              ? getStatusLabel(a.status?.conditions)
              : '';
      const bValue =
        sortIndex === 0
          ? b.metadata.name || ''
          : sortIndex === 1
            ? b.metadata.namespace || ''
            : sortIndex === 2
              ? getStatusLabel(b.status?.conditions)
              : '';

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [certificates, filter, sortIndex, sortDirection]);

  if (loadError) {
    return (
      <PageSection>
        <EmptyState>
          <Title headingLevel="h2">{t('Error loading certificates')}</Title>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant="light">
        <Content>
          <h1>{t('Certificates')}</h1>
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
              <Button variant="primary" onClick={() => (window.location.href = '/certificates/create')}>
                {t('Create Certificate')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {loaded && filteredCerts.length === 0 ? (
          <EmptyState>
            <Title headingLevel="h2">{t('No certificates found')}</Title>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={() => (window.location.href = '/certificates/create')}>
                  {t('Create Certificate')}
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
                <Th>{t('Secret')}</Th>
                <Th>{t('Issuer')}</Th>
                <Th>{t('Age')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCerts.map((cert) => {
                const statusLabel = getStatusLabel(cert.status?.conditions);
                const statusColor = getStatusColor(cert.status?.conditions);

                return (
                  <Tr key={cert.metadata.uid}>
                    <Td dataLabel={t('Name')}>
                      <a href={`/certificates/${cert.metadata.namespace}/${cert.metadata.name}`}>
                        {cert.metadata.name}
                      </a>
                    </Td>
                    <Td dataLabel={t('Namespace')}>{cert.metadata.namespace}</Td>
                    <Td dataLabel={t('Status')}>
                      <Label color={statusColor}>{statusLabel}</Label>
                    </Td>
                    <Td dataLabel={t('Secret')}>{cert.spec.secretName}</Td>
                    <Td dataLabel={t('Issuer')}>
                      {cert.spec.issuerRef.name} ({cert.spec.issuerRef.kind || 'Issuer'})
                    </Td>
                    <Td dataLabel={t('Age')}>
                      {formatTimestamp(cert.metadata.creationTimestamp)}
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

export default CertificateListPage;
