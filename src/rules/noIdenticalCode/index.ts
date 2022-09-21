import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { fetchAllLambdaConfigurations } from '../../helpers';
import { Rule, Rules } from '../../types';

const hasUniqueShaCode = (
  lambdaConfiguration: FunctionConfiguration,
  functionsArnGroupedByCodeSha: Record<string, string[]>,
): boolean => {
  const codeSha = lambdaConfiguration.CodeSha256 ?? '';

  return codeSha !== ''
    ? functionsArnGroupedByCodeSha[codeSha].length === 1
    : true;
};

const run: Rule['run'] = async resourceArns => {
  const lambdasConfigurations = await fetchAllLambdaConfigurations(
    resourceArns,
  );

  const functionsArnGroupedByCodeSha = lambdasConfigurations.reduce(
    (acc, config) => {
      const key = config.CodeSha256;
      const functionArn = config.FunctionArn;
      if (key === undefined || functionArn === undefined) {
        return acc;
      }
      if (!Object.keys(acc).includes(key)) {
        acc[key] = [];
      }
      acc[key].push(functionArn);

      return acc;
    },
    {} as Record<string, string[]>,
  );

  const results = lambdasConfigurations.map(lambdaConfiguration => {
    const shaCode = lambdaConfiguration.CodeSha256 ?? '';
    const uniqueCode = hasUniqueShaCode(
      lambdaConfiguration,
      functionsArnGroupedByCodeSha,
    );
    const identicalCodeFunctions =
      shaCode !== '' && !uniqueCode
        ? functionsArnGroupedByCodeSha[shaCode]
        : '';

    return {
      arn: lambdaConfiguration.FunctionArn ?? '',
      success: uniqueCode,
      identicalCodeFunctionsArn: identicalCodeFunctions,
    };
  });

  return { results };
};

const rule: Rule = {
  run,
  rule: Rules.NO_IDENTICAL_CODE,
};

export default rule;
