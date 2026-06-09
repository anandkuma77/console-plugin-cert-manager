import {
  CertificateCondition,
  IssuerCondition,
  CertificateRequestCondition,
  CertManagerCondition,
} from '../types';

export type Condition =
  | CertificateCondition
  | IssuerCondition
  | CertificateRequestCondition
  | CertManagerCondition;

export const getReadyCondition = (conditions?: Condition[]): Condition | undefined => {
  return conditions?.find((c) => c.type === 'Ready');
};

export const isReady = (conditions?: Condition[]): boolean => {
  const readyCondition = getReadyCondition(conditions);
  return readyCondition?.status === 'True';
};

export const getStatusLabel = (conditions?: Condition[]): string => {
  const readyCondition = getReadyCondition(conditions);

  if (!readyCondition) {
    return 'Unknown';
  }

  switch (readyCondition.status) {
    case 'True':
      return 'Ready';
    case 'False':
      return readyCondition.reason || 'Not Ready';
    case 'Unknown':
    default:
      return 'Unknown';
  }
};

export const getStatusColor = (
  conditions?: Condition[],
): 'success' | 'warning' | 'danger' | 'grey' => {
  const readyCondition = getReadyCondition(conditions);

  if (!readyCondition) {
    return 'grey';
  }

  switch (readyCondition.status) {
    case 'True':
      return 'success';
    case 'False':
      if (readyCondition.reason === 'Progressing' || readyCondition.reason === 'Issuing') {
        return 'warning';
      }
      return 'danger';
    case 'Unknown':
    default:
      return 'grey';
  }
};

export const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) {
    return '—';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 30) {
    return `${diffDay}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};
