function getApi(sys: string, path: string) {
  const prefix = '/api/';
  return `${prefix}${sys}${path}`;
}

function getRDBApi(path: string) {
  const prefix = '/api/rdb';
  return `${prefix}${path}`;
}

function getAMSCEApi(path: string) {
  const prefix = '/api/ams-ce';
  return `${prefix}${path}`;
}

function getAMSEEApi(path: string) {
  const prefix = '/api/ams-ee';
  return `${prefix}${path}`;
}

const api = {
  login: getRDBApi('/auth/login'),
  logout: getRDBApi('/auth/logout'),
  selftProfile: getRDBApi('/self/profile'),
  selftPassword: getRDBApi('/self/password'),
  selftToken: getRDBApi('/self/token'),
  user: getRDBApi('/user'),
  users: getRDBApi('/users'),
  tenant: getRDBApi('/tenant'),
  team: getRDBApi('/team'),
  teams: getRDBApi('/teams'),
  configs: getRDBApi('/configs'),
  role: getRDBApi('/role'),
  roles: getRDBApi('/roles'),
  ops: getRDBApi('/ops'),
  log: getRDBApi('/log'),
  homeStatistics: getRDBApi('/home/statistics'),
  project: getRDBApi('/project'),
  projects: getRDBApi('/projects'),
  tree: getRDBApi('/tree'),
  node: getRDBApi('/node'),
  nodes: getRDBApi('/nodes'),
  nodeCate: getRDBApi('/node-cate'),
  nodeCates: getRDBApi('/node-cates'),
  resources: getRDBApi('/resources'),
  belongProjects: getRDBApi('/belong-projects'),
  permissionPoint: getRDBApi('/self/perms/global'),

  host: getAMSCEApi('/host'),
  hosts: getAMSCEApi('/hosts'),
  nethw: getAMSEEApi('/nethw'),
  nethws: getAMSEEApi('/nethws'),
  mibs: getAMSEEApi('/mibs'),

  cluster: getApi('ccpapi', '/cluster'),

  tmpchart: getApi('mon', '/tmpchart'),
  metricsPods: getApi('mon', '/index/metrics'),
  tagkvPods: getApi('mon', '/index/tagkv'),
  metrics: getApi('index', '/metrics'),
  tagkv: getApi('index', '/tagkv'),
  fullmatch: getApi('index', '/counter/fullmatch'),
  points: getApi('transfer', '/data/ui'),
};

export default api;
