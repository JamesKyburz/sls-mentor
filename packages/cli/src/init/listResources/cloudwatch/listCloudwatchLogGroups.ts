import {
  LogGroup,
  paginateDescribeLogGroups,
} from '@aws-sdk/client-cloudwatch-logs';
import { CloudwatchLogGroupARN, cloudWatchLogsClient } from '@sls-mentor/core';

export const listCloudwatchLogGroups = async (): Promise<
  CloudwatchLogGroupARN[]
> => {
  const cloudwatchLogGroups: LogGroup[] = [];

  for await (const resources of paginateDescribeLogGroups(
    { client: cloudWatchLogsClient },
    {},
  )) {
    cloudwatchLogGroups.push(...(resources.logGroups ?? []));
  }

  return cloudwatchLogGroups
    .map(({ logGroupName }) => logGroupName)
    .filter(
      (logGroupName): logGroupName is string => logGroupName !== undefined,
    )
    .map(CloudwatchLogGroupARN.fromLogGroupName);
};
