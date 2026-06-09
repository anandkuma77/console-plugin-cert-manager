import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageSection,
  Content,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Title,
  Spinner,
} from '@patternfly/react-core';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { CertManager, CertManagerModel } from '../../types';

const CertManagerDetailsPage: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');
  const { name } = useParams<{ name: string }>();

  const [certManager, loaded, loadError] = useK8sWatchResource<CertManager>({
    groupVersionKind: {
      group: CertManagerModel.apiGroup,
      version: CertManagerModel.apiVersion,
      kind: CertManagerModel.kind,
    },
    name: name || 'cluster',
    namespaced: false,
  });

  if (loadError) {
    return (
      <PageSection>
        <Content>
          <Title headingLevel="h2">{t('Error loading CertManager configuration')}</Title>
          <p>{loadError.message || t('Failed to load resource')}</p>
        </Content>
      </PageSection>
    );
  }

  if (!loaded) {
    return (
      <PageSection>
        <Spinner />
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant="default">
        <Content>
          <Title headingLevel="h1">{certManager?.metadata?.name || 'cluster'}</Title>
        </Content>
      </PageSection>
      <PageSection>
        <Grid hasGutter>
          <GridItem span={12}>
            <Card>
              <CardTitle>{t('Configuration')}</CardTitle>
              <CardBody>
                <DescriptionList columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Management State')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.managementState || 'Managed'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Log Level')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.logLevel || 'Normal'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12} md={4}>
            <Card>
              <CardTitle>{t('Controller')}</CardTitle>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Replicas')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.controllerConfig?.replicas || 1}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('CPU Request')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.controllerConfig?.resources?.requests?.cpu || t('Not set')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Memory Request')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.controllerConfig?.resources?.requests?.memory || t('Not set')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12} md={4}>
            <Card>
              <CardTitle>{t('Webhook')}</CardTitle>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Replicas')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.webhookConfig?.replicas || 1}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('CPU Request')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.webhookConfig?.resources?.requests?.cpu || t('Not set')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Memory Request')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.webhookConfig?.resources?.requests?.memory || t('Not set')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12} md={4}>
            <Card>
              <CardTitle>{t('CA Injector')}</CardTitle>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Replicas')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.cainjectorConfig?.replicas || 1}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('CPU Request')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.cainjectorConfig?.resources?.requests?.cpu || t('Not set')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Memory Request')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {certManager?.spec?.cainjectorConfig?.resources?.requests?.memory || t('Not set')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export default CertManagerDetailsPage;
