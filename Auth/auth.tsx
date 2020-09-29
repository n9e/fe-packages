import _ from 'lodash';
import api from '../api';
import request from '../request';
export interface UserProfile {
  id: number,
  username: string,
  dispname: string,
  email: string,
  phone: string,
  im: string,
  isroot: boolean,
}

export default (function auth() {
  let isAuthenticated = false;
  let selftProfile = {} as UserProfile;
  return {
    getIsAuthenticated() {
      return isAuthenticated;
    },
    getSelftProfile() {
      return selftProfile;
    },
    checkAuthenticate: async () => {
      try {
        const dat = await request(api.selftProfile);
        isAuthenticated = true;
        selftProfile = {
          ...dat,
          isroot: dat.is_root === 1,
        };
      } catch (e) {
        console.log(e);
      }
    },
    authenticate: async (reqBody: any, cbk: (selftProfile: UserProfile) => void) => {
      try {
        await request(api.login, {
          method: 'POST',
          body: JSON.stringify(reqBody),
        });
        isAuthenticated = true;
        selftProfile = await request(api.selftProfile);
        if (_.isFunction(cbk)) cbk(selftProfile);
      } catch (e) {
        console.log(e);
      }
    },
    signout: async (cbk: (p: any) => void) => {
      try {
        const dat = await fetch(api.logout);
        isAuthenticated = false;
        if (_.isFunction(cbk)) cbk(dat);
      } catch (e) {
        console.log(e);
      }
    },
  };
}());
