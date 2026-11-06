#!/usr/bin/env bash
# Configuração única da AWS para o deploy do GrammAIr Flow.
# Rodar no AWS CloudShell (us-east-1), logado como admin-solo.
# O script é idempotente: pode rodar de novo sem quebrar nada.
set -euo pipefail

REGION=us-east-1
REPO_GH="guilherme-machado-ceo/grammair-flow"
ECR_REPO=grammair-flow
FUNCTION=grammair-flow
LAMBDA_ROLE=grammair-flow-lambda
DEPLOY_ROLE=grammair-flow-github-deploy
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

echo "Conta: $ACCOUNT  Região: $REGION"

# 1. Repositório de imagens (Amazon ECR), guardando só as 5 últimas.
aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$REGION" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "$ECR_REPO" --region "$REGION" >/dev/null
aws ecr put-lifecycle-policy --repository-name "$ECR_REPO" --region "$REGION" --lifecycle-policy-text \
  '{"rules":[{"rulePriority":1,"description":"manter 5","selection":{"tagStatus":"any","countType":"imageCountMoreThan","countNumber":5},"action":{"type":"expire"}}]}' >/dev/null

# 2. Papel de execução da função Lambda (só logs no CloudWatch).
aws iam get-role --role-name "$LAMBDA_ROLE" >/dev/null 2>&1 || {
  aws iam create-role --role-name "$LAMBDA_ROLE" --assume-role-policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null
  aws iam attach-role-policy --role-name "$LAMBDA_ROLE" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
}

# 3. Login do GitHub Actions na AWS sem chave de acesso (OIDC).
OIDC_ARN="arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com"
aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" >/dev/null 2>&1 \
  || aws iam create-open-id-connect-provider --url https://token.actions.githubusercontent.com \
       --client-id-list sts.amazonaws.com >/dev/null

# 4. Papel que o workflow assume. Só a branch main deste repositório pode usá-lo.
TRUST=$(cat <<EOF
{"Version":"2012-10-17","Statement":[{"Effect":"Allow",
 "Principal":{"Federated":"${OIDC_ARN}"},
 "Action":"sts:AssumeRoleWithWebIdentity",
 "Condition":{"StringEquals":{"token.actions.githubusercontent.com:aud":"sts.amazonaws.com",
   "token.actions.githubusercontent.com:sub":"repo:${REPO_GH}:ref:refs/heads/main"}}}]}
EOF
)
aws iam get-role --role-name "$DEPLOY_ROLE" >/dev/null 2>&1 \
  && aws iam update-assume-role-policy --role-name "$DEPLOY_ROLE" --policy-document "$TRUST" \
  || aws iam create-role --role-name "$DEPLOY_ROLE" --assume-role-policy-document "$TRUST" >/dev/null

# Permissões mínimas: enviar imagem a este ECR e gerenciar só esta função.
POLICY=$(cat <<EOF
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":"ecr:GetAuthorizationToken","Resource":"*"},
 {"Effect":"Allow","Action":["ecr:BatchCheckLayerAvailability","ecr:BatchGetImage","ecr:GetDownloadUrlForLayer",
   "ecr:InitiateLayerUpload","ecr:UploadLayerPart","ecr:CompleteLayerUpload","ecr:PutImage"],
   "Resource":"arn:aws:ecr:${REGION}:${ACCOUNT}:repository/${ECR_REPO}"},
 {"Effect":"Allow","Action":["lambda:GetFunction","lambda:CreateFunction","lambda:UpdateFunctionCode",
   "lambda:GetFunctionConfiguration","lambda:PutFunctionConcurrency","lambda:GetFunctionUrlConfig",
   "lambda:CreateFunctionUrlConfig","lambda:AddPermission"],
   "Resource":"arn:aws:lambda:${REGION}:${ACCOUNT}:function:${FUNCTION}"},
 {"Effect":"Allow","Action":"iam:PassRole","Resource":"arn:aws:iam::${ACCOUNT}:role/${LAMBDA_ROLE}",
   "Condition":{"StringEquals":{"iam:PassedToService":"lambda.amazonaws.com"}}}]}
EOF
)
aws iam put-role-policy --role-name "$DEPLOY_ROLE" --policy-name grammair-flow-deploy --policy-document "$POLICY"

echo
echo "Pronto. Crie no GitHub a variável AWS_ROLE_ARN com este valor:"
echo "arn:aws:iam::${ACCOUNT}:role/${DEPLOY_ROLE}"
