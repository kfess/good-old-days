import { siTerraform } from 'simple-icons';
import { logo } from '../../components/logo';
import { reducedMotion, ScrollTrigger } from '../../core/scroll';
import { holdHudYear } from '../../core/stage';
import { esc, h } from '../../core/util';
import { k8sMark } from './k8s-logo';

/*
 * 2020: before Argo CD can deploy anything, someone has to build the cluster.
 * Terraform 0.12.6+ (resource for_each) + AWS provider 2.70: remote state in S3 with a DynamoDB lock.
 * EKS capped a managed node group at 100 nodes in 2020, so the fleet is 10 groups (max 1,000 nodes);
 * the Kubernetes set piece later scales to 915 nodes within that.
 * The plan count (26) is exactly what this configuration creates:
 *   vpc 1 · internet gateway 1 · public subnets 3 · route table 1 · route table associations 3
 *   · IAM roles 2 · IAM policy attachments 4 · EKS cluster 1 · EKS node groups 10
 */
const GROUPS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

const MAIN_TF = `terraform {
  required_version = ">= 0.12.6"
  backend "s3" {
    bucket         = "acme-tfstate"
    key            = "prod/eks.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  version = "~> 2.70"
  region  = "us-east-1"
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 2, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    "kubernetes.io/cluster/prod" = "shared"
  }
}

# + internet gateway, route table + 3 associations, 2 IAM roles, 4 policy attachments (11 more)

resource "aws_eks_cluster" "prod" {
  name     = "prod"
  role_arn = aws_iam_role.cluster.arn
  version  = "1.17"
  vpc_config {
    subnet_ids = aws_subnet.public[*].id
  }
}

# a managed node group tops out at 100 nodes, so: ten of them
resource "aws_eks_node_group" "web" {
  for_each        = toset(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"])
  cluster_name    = aws_eks_cluster.prod.name
  node_group_name = "web-\${each.key}"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.public[*].id
  instance_types  = ["m5.large"]
  scaling_config {
    desired_size = 1
    min_size     = 1
    max_size     = 100
  }
  # the Cluster Autoscaler owns the node count from here on
  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }
}`;

/** A deliberately tiny HCL highlighter: comments, strings, block keywords, attribute names. */
function hcl(src: string): string {
  return src
    .split('\n')
    .map((line) => {
      if (/^\s*#/.test(line)) return `<span class="c">${esc(line)}</span>`;
      let out = esc(line);
      out = out.replace(/&quot;.*?&quot;/g, (m) => `<span class="s">${m}</span>`);
      out = out.replace(
        /^(\s*)(terraform|provider|resource|data|backend|vpc_config|scaling_config|lifecycle|tags)\b/,
        '$1<span class="k">$2</span>',
      );
      out = out.replace(/^(\s*)([a-z_]+)(\s+=)/, '$1<span class="a">$2</span>$3');
      return out;
    })
    .join('\n');
}

type Line = { t: string; cls?: string; stage?: string };
const PLAN_RESOURCES = [
  'aws_eks_cluster.prod',
  ...GROUPS.map((g) => `aws_eks_node_group.web["${g}"]`),
  'aws_iam_role.cluster',
  'aws_iam_role.node',
  'aws_iam_role_policy_attachment.cluster_policy',
  'aws_iam_role_policy_attachment.node_cni',
  'aws_iam_role_policy_attachment.node_ecr',
  'aws_iam_role_policy_attachment.node_worker',
  'aws_internet_gateway.main',
  'aws_route_table.public',
  'aws_route_table_association.public[0]',
  'aws_route_table_association.public[1]',
  'aws_route_table_association.public[2]',
  'aws_subnet.public[0]',
  'aws_subnet.public[1]',
  'aws_subnet.public[2]',
  'aws_vpc.main',
];

const RULE = '------------------------------------------------------------------------';

const PLAN: Line[] = [
  { t: '$ terraform plan -out=tfplan', cls: 'cmd' },
  { t: 'Acquiring state lock. This may take a few moments...', cls: 'dim', stage: 'lock' },
  { t: 'Refreshing Terraform state in-memory prior to plan...', cls: 'dim' },
  { t: 'The refreshed state will be used to calculate this plan, but will not be', cls: 'dim' },
  { t: 'persisted to local or remote state storage.', cls: 'dim' },
  { t: '' },
  { t: 'data.aws_availability_zones.available: Refreshing state...', cls: 'dim' },
  { t: '' },
  { t: RULE, cls: 'dim' },
  { t: '' },
  { t: 'An execution plan has been generated and is shown below.' },
  { t: 'Resource actions are indicated with the following symbols:' },
  { t: '  + create', cls: 'add' },
  { t: '' },
  { t: 'Terraform will perform the following actions:' },
  ...PLAN_RESOURCES.map((r) => ({ t: `  # ${r} will be created`, cls: 'add' })),
  { t: '' },
  { t: 'Plan: 26 to add, 0 to change, 0 to destroy.', cls: 'strong' },
  { t: '' },
  { t: RULE, cls: 'dim' },
  { t: '' },
  { t: 'This plan was saved to: tfplan' },
  { t: '' },
  { t: 'To perform exactly these actions, run the following command to apply:' },
  { t: '    terraform apply "tfplan"', stage: 'unlock' },
];

const ATT = ['cluster_policy', 'node_worker', 'node_cni', 'node_ecr'];
const ATT_ID = (n: number) => `prod-eks-${n === 0 ? 'cluster' : 'node'}-2020071609341234560000000${n + 1}`;
const SUBNET_IDS = ['subnet-0c41a9e3f2b7d8a10', 'subnet-07d2e8b16a3c4f925', 'subnet-0e9b5a7c3d1f62b48'];
const ASSOC_IDS = ['rtbassoc-0a9c3e1d7b5f24680', 'rtbassoc-04e8b2a6c1d9f3757', 'rtbassoc-0f1d5b9e3a7c62841'];

// `stage` ties a line to the diagram: when that line is shown, the part lights up
const APPLY: Line[] = [
  { t: '$ terraform apply "tfplan"', cls: 'cmd' },
  { t: 'Acquiring state lock. This may take a few moments...', cls: 'dim', stage: 'lock' },
  { t: 'aws_iam_role.cluster: Creating...' },
  { t: 'aws_iam_role.node: Creating...' },
  { t: 'aws_vpc.main: Creating...' },
  { t: 'aws_iam_role.cluster: Creation complete after 1s [id=prod-eks-cluster]' },
  { t: 'aws_iam_role.node: Creation complete after 1s [id=prod-eks-node]' },
  ...ATT.map((a) => ({ t: `aws_iam_role_policy_attachment.${a}: Creating...` })),
  ...ATT.map((a, i) => ({ t: `aws_iam_role_policy_attachment.${a}: Creation complete after 1s [id=${ATT_ID(i)}]` })),
  { t: 'aws_vpc.main: Creation complete after 3s [id=vpc-0a1b2c3d4e5f67890]', stage: 'vpc' },
  { t: 'aws_internet_gateway.main: Creating...' },
  ...[0, 1, 2].map((i) => ({ t: `aws_subnet.public[${i}]: Creating...` })),
  { t: 'aws_internet_gateway.main: Creation complete after 1s [id=igw-0f3e2d1c0b9a87654]', stage: 'igw' },
  { t: 'aws_route_table.public: Creating...' },
  ...[0, 1, 2].map((i) => ({
    t: `aws_subnet.public[${i}]: Creation complete after 2s [id=${SUBNET_IDS[i]}]`,
    stage: `sub${i}`,
  })),
  { t: 'aws_eks_cluster.prod: Creating...', stage: 'cp' },
  { t: 'aws_route_table.public: Creation complete after 1s [id=rtb-0b7e4c2a9d1f35e86]' },
  ...[0, 1, 2].map((i) => ({ t: `aws_route_table_association.public[${i}]: Creating...` })),
  ...[0, 1, 2].map((i) => ({
    t: `aws_route_table_association.public[${i}]: Creation complete after 0s [id=${ASSOC_IDS[i]}]`,
  })),
  { t: 'aws_eks_cluster.prod: Still creating... [10s elapsed]', cls: 'dim' },
  { t: 'aws_eks_cluster.prod: Still creating... [20s elapsed]', cls: 'dim' },
  { t: '⋮', cls: 'dim' },
  { t: 'aws_eks_cluster.prod: Still creating... [9m50s elapsed]', cls: 'dim' },
  { t: 'aws_eks_cluster.prod: Creation complete after 9m58s [id=prod]', stage: 'cpdone' },
  // ten node groups, created in parallel (Terraform's default parallelism is 10)
  ...GROUPS.map((g) => ({ t: `aws_eks_node_group.web["${g}"]: Creating...` })),
  { t: 'aws_eks_node_group.web["a"]: Still creating... [10s elapsed]', cls: 'dim' },
  { t: '⋮', cls: 'dim' },
  { t: 'aws_eks_node_group.web["j"]: Still creating... [2m10s elapsed]', cls: 'dim' },
  ...GROUPS.map((g, i) => ({
    t: `aws_eks_node_group.web["${g}"]: Creation complete after 2m${(12 + ((i * 7) % 9)).toString().padStart(2, '0')}s [id=prod:web-${g}]`,
    stage: i === 0 ? 'nodes' : undefined,
  })),
  { t: '' },
  { t: 'Apply complete! Resources: 26 added, 0 changed, 0 destroyed.', cls: 'ok', stage: 'unlock' },
];

const AZS = ['us-east-1a', 'us-east-1b', 'us-east-1c'];

export function createTerraform(section: HTMLElement): HTMLElement {
  const el = h(`
    <div class="tf">
      <div class="tf__sticky">
        <header class="tf__head">
          <p class="y18-kicker tf__kicker"><span class="tf__mark">${logo(siTerraform)}</span>2020 · Terraform 0.12 · AWS provider 2.70</p>
          <h3 class="y18-h tf__h">First, the cluster itself.<br/><span>Written down, planned, applied.</span></h3>
        </header>
        <div class="tf__grid">
          <div class="tf__editor" aria-label="main.tf">
            <div class="tf__bar"><i></i><i></i><i></i><span>main.tf</span></div>
            <pre class="tf__code"><code>${hcl(MAIN_TF)}</code></pre>
          </div>
          <div class="tf__term">
            <div class="tf__bar"><i></i><i></i><i></i><span>~/infra/prod — terraform</span></div>
            <pre class="tf__log" aria-live="off"></pre>
          </div>
          <div class="tf__map" aria-label="AWS us-east-1: a VPC with three public subnets, an EKS control plane and ten node groups">
            <div class="tf__state" data-stage="lock">
              <b>S3</b> acme-tfstate/prod/eks.tfstate<span><b>DynamoDB</b> terraform-locks · <em class="tf__lock">unlocked</em></span>
            </div>
            <div class="tf__region"><span class="tf__label">AWS · us-east-1</span>
              <div class="tf__cp" data-stage="cp">
                <span class="tf__cpmark">${k8sMark()}</span>
                <div><b>EKS control plane</b><span class="tf__cpstate">creating…</span><small>Kubernetes 1.17 · managed by AWS</small></div>
              </div>
              <div class="tf__vpc" data-stage="vpc"><span class="tf__label">VPC · 10.0.0.0/16</span>
                <span class="tf__igw" data-stage="igw">IGW</span>
                <div class="tf__azs">
                  ${AZS.map(
                    (az, i) => `
                    <div class="tf__az" data-stage="sub${i}">
                      <span class="tf__label">${az}</span>
                      <span class="tf__subnet">10.0.${i * 64}.0/18</span>
                      <span class="tf__node" data-stage="nodes"><i></i>m5.large × ${[4, 3, 3][i]}</span>
                    </div>`,
                  ).join('')}
                </div>
                <span class="tf__ngs" data-stage="nodes">10 node groups · web-a … web-j · max 100 nodes each</span>
              </div>
            </div>
          </div>
        </div>
        <p class="tf__handoff">Infrastructure by Terraform.<br/><span>Applications by Argo CD.</span></p>
        <aside class="tf__leak" aria-hidden="true">
          <pre><span class="tf__leak-c" data-at="0.015">$ git add . &amp;&amp; git commit -m "wip"</span><span data-at="0.03">[master 9f3c2e1] wip</span><span data-at="0.03"> 2 files changed, 41 insertions(+)</span><span class="tf__leak-bad" data-at="0.03"> create mode 100644 terraform.tfvars</span><span class="tf__leak-c" data-at="0.05">$ git push origin master</span></pre>
          <p class="tf__leak-alert" data-at="0.075"><b>✉ AWS</b>Access key AKIA••••••••7Q2X found in a public GitHub repo. A quarantine policy was attached to its IAM user.</p>
          <small data-at="0.1">Everyone did it once.</small>
        </aside>
      </div>
    </div>`);
  section.appendChild(el);

  const log = el.querySelector<HTMLElement>('.tf__log')!;
  const parts = Array.from(el.querySelectorAll<HTMLElement>('[data-stage]'));
  const lock = el.querySelector<HTMLElement>('.tf__lock')!;
  const cpState = el.querySelector<HTMLElement>('.tf__cpstate')!;
  const handoff = el.querySelector<HTMLElement>('.tf__handoff')!;
  const editor = el.querySelector<HTMLElement>('.tf__code')!;
  const leak = el.querySelector<HTMLElement>('.tf__leak')!;
  const leakLines = Array.from(leak.querySelectorAll<HTMLElement>('[data-at]'));
  const all = [...PLAN, { t: '' }, ...APPLY];
  const planEnd = PLAN.length + 1;

  let shown = -1;
  const render = (p: number) => {
    // 0–0.12 read main.tf · 0.12–0.42 plan · 0.42–0.9 apply · 0.9–1 hand-off
    const planP = Math.min(1, Math.max(0, (p - 0.12) / 0.3));
    const applyP = Math.min(1, Math.max(0, (p - 0.42) / 0.48));
    const count = applyP > 0 ? planEnd + Math.round(applyP * APPLY.length) : Math.round(planP * PLAN.length);
    // read the whole main.tf while the plan is being computed
    editor.scrollTop = Math.min(1, p / 0.4) * (editor.scrollHeight - editor.clientHeight);
    handoff.classList.toggle('is-on', p > 0.9);
    // a side-note before the plan: the commit everyone made once
    leak.classList.toggle('is-on', p > 0.008 && p < 0.16);
    leakLines.forEach((line) => line.classList.toggle('is-in', p >= Number(line.dataset.at)));
    el.classList.toggle('is-handoff', p > 0.9);
    if (count === shown) return;
    shown = count;
    const lines = all.slice(0, count);
    log.innerHTML = lines.map((l) => `<span class="${l.cls ?? ''}">${esc(l.t)}</span>`).join('\n');
    log.scrollTop = log.scrollHeight;
    const reached = new Set(lines.map((l) => l.stage).filter(Boolean));
    parts.forEach((part) => part.classList.toggle('is-on', reached.has(part.dataset.stage!)));
    el.querySelector('.tf__cp')!.classList.toggle('is-ready', reached.has('cpdone'));
    cpState.textContent = reached.has('cpdone') ? 'ACTIVE' : 'creating…';
    // plan and apply each take the DynamoDB lock and give it back
    let locked = false;
    for (const l of lines) {
      if (l.stage === 'lock') locked = true;
      if (l.stage === 'unlock') locked = false;
    }
    lock.textContent = locked ? 'locked' : 'unlocked';
    lock.classList.toggle('is-locked', locked);
  };

  if (reducedMotion) {
    el.classList.add('is-static');
    render(1);
    return el;
  }
  render(0);
  ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => render(self.progress),
  });
  // the scene is dated 2020 (Terraform 0.12, AWS provider 2.70, EKS 1.17): the HUD says so too
  // (measured at the HUD's own 55% line, after the pins above)
  ScrollTrigger.create({
    trigger: el,
    start: 'top 55%',
    end: 'bottom 55%',
    refreshPriority: -1,
    onToggle: (self) => holdHudYear(self.isActive ? 2020 : null),
  });
  return el;
}
