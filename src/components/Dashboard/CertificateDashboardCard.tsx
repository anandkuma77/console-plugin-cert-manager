import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardTitle,
  CardBody,
  Label,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Certificate, CertificateModel } from '../../models/Certificate';

const CertificateDashboardCard: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');

  const [certificates, loaded, loadError] = useK8sWatchResource<Certificate[]>({
    groupVersionKind: {
      group: CertificateModel.apiGroup,
      version: CertificateModel.apiVersion,
      kind: CertificateModel.kind,
    },
    isList: true,
    namespaced: true,
  });

  const getCertificateStatus = (cert: Certificate): string => {
    const conditions = cert.status?.conditions || [];
    const readyCondition = conditions.find((c) => c.type === 'Ready');

    if (readyCondition?.status === 'True') {
      return 'Ready';
    }

    if (readyCondition?.status === 'False') {
      return 'Failed';
    }

    return 'Progressing';
  };

  const statusCounts = React.useMemo(() => {
    if (!loaded || loadError) {
      return { Ready: 0, Failed: 0, Progressing: 0 };
    }

    return certificates.reduce(
      (acc, cert) => {
        const status = getCertificateStatus(cert);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Ready: 0, Failed: 0, Progressing: 0 } as Record<string, number>,
    );
  }, [certificates, loaded, loadError]);

  return (
    <Card>
      <CardTitle>{t('Certificates')}</CardTitle>
      <CardBody>
        {loaded && !loadError ? (
          <Flex
            spaceItems={{ default: 'spaceItemsMd' }}
            direction={{ default: 'column' }}
          >
            <FlexItem>
              <Label color="green" isCompact>
                {t('Ready')}: {statusCounts.Ready}
              </Label>
            </FlexItem>
            <FlexItem>
              <Label color="red" isCompact>
                {t('Failed')}: {statusCounts.Failed}
              </Label>
            </FlexItem>
            <FlexItem>
              <Label color="blue" isCompact>
                {t('Progressing')}: {statusCounts.Progressing}
              </Label>
            </FlexItem>
          </Flex>
        ) : loadError ? (
          <div>{t('Error loading certificates')}</div>
        ) : (
          <div>{t('Loading...')}</div>
        )}
      </CardBody>
    </Card>
  );
};

export default CertificateDashboardCard;
