import _ from 'lodash';
import api from '../api';
import request from '../request';
export interface UserProfile {
  id: number;
  username: string;
  dispname: string;
  email: string;
  phone: string;
  im: string;
  isroot: boolean;
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
    checkAuthenticate: async (redirectToLogin = true) => {
      try {
        const dat = await request(api.selftProfile, undefined, true, redirectToLogin);
        isAuthenticated = true;
        selftProfile = {
          ...dat,
          isroot: dat.is_root === 1,
        };
      } catch (e) {
        console.log(e);
      }
    },
    authenticate: async (
      reqBody: any,
      cbk: (selftProfile: UserProfile) => void
    ) => {
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

    // authorize: async (data: any) => {
    //   try {
    //     const dat = data.redirect;
    //     window.location.href = api.authorize + '?redirect=' + dat;
    //   } catch (e) {
    //     console.log(e);
    //   }
    // },
    authorize: async (data: any) => {
      try {
        const url = await request(api.authorize + '?redirect=' + data.redirect);
        window.location.href = url.redirect;
      } catch (e) {
        console.log(e);
      }
    },

    signout: async (cbk: (p: any) => void) => {
      try {
        const logout = await request(api.logout);
        const err = logout.err;
        if (err) {
          console.log(err);
        } else {
          if (logout.redirect) {
            window.location.href = logout.redirect;
          }else{
            isAuthenticated = false;
            if (_.isFunction(cbk)) cbk(logout.msg);
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  };
})();
