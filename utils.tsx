import _ from 'lodash';
import { defaultPageSizeOptions } from './config';

export const getPaginationOptions = (onShowSizeChange?: (size: number) => void) => {
  const _defaultPageSize = window.localStorage.getItem('ecmc-global-pagesize');
  const defaultPageSize = _defaultPageSize ? Number(_defaultPageSize) : undefined;
  return {
    pageSize: defaultPageSize,
    showSizeChanger: true,
    pageSizeOptions: defaultPageSizeOptions,
    onShowSizeChange: (_current: any, size: number) => {
      window.localStorage.setItem('ecmc-global-pagesize', String(size));
      if (onShowSizeChange) onShowSizeChange(size);
    },
  };
};

export function fetchManifest(url: string, publicPath: string) {
  return fetch(url).then((res) => {
    return res.text();
  }).then((data) => {
    if (data) {
      const manifest = data.match(/<meta name="manifest" content="([\w|\d|-]+.json)">/);
      let result = '';
      if (publicPath && manifest) {
        result = `${publicPath}${manifest[1]}`;
      }
      return result;
    }
  });
}

export async function getPathBySuffix(systemConf: any, jsonData: any, suffix: string) {
  let targetPath = '';
  Object.values(jsonData.assetsByChunkName).forEach((assetsArr) => {
    if(typeof assetsArr === 'string') {
      targetPath = assetsArr
    }
    if(Array.isArray(assetsArr)) {
      targetPath = assetsArr.find((assetStr) => {
        const assetsSuffix = assetStr.match(/\.[^\.]+$/) ? assetStr.match(/\.[^\.]+$/)[0] : '';
        return assetsSuffix === suffix;
      });
    }
  });
  if (process.env.NODE_ENV === 'development') {
    return `${systemConf[process.env.NODE_ENV].publicPath}${targetPath}`;
  }
  return `${systemConf[process.env.NODE_ENV as any].publicPath}${targetPath}`;
}

export function createStylesheetLink(ident: string, path: string) {
  const headEle = document.getElementsByTagName('head')[0];
  const linkEle = document.createElement('link');
  linkEle.id = `${ident}-stylesheet`;
  linkEle.rel = 'stylesheet';
  linkEle.href = path;
  headEle.append(linkEle);
}


export function parseJSON(json: string) {
	if (typeof json === 'string') {
    let paresed;
    try {
      paresed = JSON.parse(json);
    } catch (e) {
      console.log(e);
    }
    return paresed;
  }
  return undefined;
}

export function getDefaultTenantProject(data: any[]) {
  const defaultProject = _.find(_.sortBy(data, 'id'), { cate: 'project' });
  let defaultTenant = {};
  const make = (data: any[], project: any) => {
    _.forEach(data, (item) => {
      if (item.id === project.pid) {
        if (item.cate === 'tenant') {
          defaultTenant = item;
          return false;
        }
        make(data, item);
      }
    });
  };
  make(data, defaultProject);
  return {
    tenant: {
      id: _.get(defaultTenant, 'id'),
      ident: _.get(defaultTenant, 'ident'),
    },
    project: {
      id: _.get(defaultProject, 'id'),
      ident: _.get(defaultProject, 'ident'),
      path: _.get(defaultProject, 'path'),
    },
  }
};

export function getTenantProjectByProjectId(projsData: any[], id: number) {
  let tenantProject = {
    tenant: {
      id: undefined,
      ident: undefined,
    },
    project: {
      id: undefined,
      ident: undefined,
      path: undefined,
    },
  };
  function make(nid: number, isFirst: boolean) {
    const finded = _.find(projsData, { id: nid });
    if (isFirst) {
      if (finded && finded.cate === 'project') {
        tenantProject.project = {
          id: finded.id,
          ident: finded.ident,
          path: finded.path,
        };
        make(finded.pid, false);
      } else {
        const defaultTenantProject = getDefaultTenantProject(projsData);
        tenantProject = defaultTenantProject as any;
      }
    } else {
      if (finded.cate === 'tenant') {
        tenantProject.tenant = {
          id: finded.id,
          ident: finded.ident,
        };
      } else {
        make(finded.pid, false);
      }
    }
  }
  make(id, true);
  return tenantProject;
}

