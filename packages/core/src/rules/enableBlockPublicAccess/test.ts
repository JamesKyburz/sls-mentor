import { BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DefaultBucket } from '../../../tests/constructs';
import { enableBlockPublicAccess as BlockPublicAccessRule } from './index';

type EnableBlockPublicAccessProps = {
  enableBlockPublicAccess: BlockPublicAccess | undefined;
};

export class EnableBlockPublicAccess extends Construct {
  static passTestCases: Record<string, EnableBlockPublicAccessProps> = {
    Blocked: {
      enableBlockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    },
  };

  static failTestCases: Record<string, EnableBlockPublicAccessProps> = {
    'Not blocked': { enableBlockPublicAccess: undefined },
  };

  constructor(
    scope: Construct,
    id: string,
    { enableBlockPublicAccess }: EnableBlockPublicAccessProps,
  ) {
    super(scope, id);
    const bucket = new DefaultBucket(this, 'Bucket', {
      blockPublicAccess: enableBlockPublicAccess,
    });
    bucket.tagRule(BlockPublicAccessRule);
  }
}
