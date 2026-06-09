import * as React from 'react';
import {
  DetailsPage,
  DetailsPageProps,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import { CertManager } from '../../types';
import { CertManagerModel } from '../../models';

const CertManagerDetails: React.FC<{ obj: CertManager }> = ({ obj }) => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');

  return (
    <Grid hasGutter>
      <GridItem span={12}>
        <Card>
          <CardTitle>{t('Configuration')}</CardTitle>
          <CardBody>
            <DescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Management State')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.managementState || 'Managed'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Log Level')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.logLevel || 'Normal'}
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
                  {obj.spec?.controllerConfig?.replicas || 1}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('CPU Request')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.controllerConfig?.resources?.requests?.cpu || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Memory Request')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.controllerConfig?.resources?.requests?.memory || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('CPU Limit')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.controllerConfig?.resources?.limits?.cpu || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Memory Limit')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.controllerConfig?.resources?.limits?.memory || 'Not set'}
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
                  {obj.spec?.webhookConfig?.replicas || 1}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('CPU Request')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.webhookConfig?.resources?.requests?.cpu || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Memory Request')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.webhookConfig?.resources?.requests?.memory || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('CPU Limit')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.webhookConfig?.resources?.limits?.cpu || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Memory Limit')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.webhookConfig?.resources?.limits?.memory || 'Not set'}
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
                  {obj.spec?.cainjectorConfig?.replicas || 1}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('CPU Request')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.cainjectorConfig?.resources?.requests?.cpu || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Memory Request')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.cainjectorConfig?.resources?.requests?.memory || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('CPU Limit')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.cainjectorConfig?.resources?.limits?.cpu || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Memory Limit')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {obj.spec?.cainjectorConfig?.resources?.limits?.memory || 'Not set'}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

const CertManagerDetailsPage: React.FC<DetailsPageProps> = (props) => {
  const { t } = useTranslation('plugin__console-plugin-cert-manager');

  return (
    <DetailsPage
      {...props}
      model={CertManagerModel}
      pages={[
        {
          href: '',
          name: t('Details'),
          component: CertManagerDetails,
        },
      ]}
    />
  );
};

export default CertManagerDetailsPage;
