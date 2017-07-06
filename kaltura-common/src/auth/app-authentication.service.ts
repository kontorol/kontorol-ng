import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import * as R from 'ramda';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaPermissionFilter } from 'kaltura-typescript-client/types/KalturaPermissionFilter';
import { UserLoginByLoginIdAction } from 'kaltura-typescript-client/types/UserLoginByLoginIdAction';
import { UserGetByLoginIdAction } from 'kaltura-typescript-client/types/UserGetByLoginIdAction';
import { UserGetAction } from 'kaltura-typescript-client/types/UserGetAction';
import { PermissionListAction } from 'kaltura-typescript-client/types/PermissionListAction';
import { PartnerGetInfoAction } from 'kaltura-typescript-client/types/PartnerGetInfoAction';
import { PermissionGetCurrentPermissionsAction } from 'kaltura-typescript-client/types/PermissionGetCurrentPermissionsAction';

import { AppUser } from "./app-user";
import { AppStorage } from "../app-storage.service";
import { PartnerInfo } from "./partner-info";


export enum AppAuthStatusTypes {
    UserLoggedIn,
    UserLoggedOut
}

@Injectable()
export class AppAuthentication {

    private _appUser : AppUser;
    private _appAuthStatus = new BehaviorSubject<AppAuthStatusTypes>(AppAuthStatusTypes.UserLoggedOut);

    appEvents$ = this._appAuthStatus.asObservable();

    defaultRoutes = {
        loginRoute: "",
        defaultRoute: "",
        errorRoute: ""
    }

    constructor(
                private kalturaServerClient : KalturaClient,
                private appStorage : AppStorage
                ) {
        this._appUser = new AppUser();
    }

    get currentAppEvent() : AppAuthStatusTypes{
        return this._appAuthStatus.getValue();
    }

    get appUser() : AppUser{
        return this._appUser;
    }

    login(loginId : string, password : string, optional : { privileges?, expiry? } = {privileges : '', expiry:86400}) : Observable<boolean> {

        const expiry = (optional ? optional.expiry : null) || 86400;
        const privileges = optional ? optional.privileges : '';

        this.appStorage.removeFromSessionStorage('auth.login.ks');  // clear session storage

        const permissionFilter = new KalturaPermissionFilter();
        permissionFilter.nameEqual = 'FEATURE_DISABLE_REMEMBER_ME';


        const request = new KalturaMultiRequest(
                new UserLoginByLoginIdAction(
                {
                    loginId,
                    password,
                    expiry : expiry,
                    privileges : privileges
                }),
                new UserGetByLoginIdAction({loginId, ks : '{1:result}' }),
                new PermissionListAction(
                    {
                        filter: permissionFilter,
                        ks : '{1:result}'
                    }
                ),
                new PartnerGetInfoAction({
                    ks : '{1:result}'
                })
                    .setDependency(['id',1,'partnerId'])
                    ,

                <any>new PermissionGetCurrentPermissionsAction({
                    ks : '{1:result}'
                })
            );

       return <any>(this.kalturaServerClient.multiRequest(request).map(
           response =>
           {
               if (!response.hasErrors())
               {
                   const ks = response[0].result;
                   const generalProperties = R.pick(['id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'])(response[1].result);
                   const permissions = R.map(R.pick(['id', 'type', 'name', 'status']))(response[2].result.objects);
                   const partnerProperties: any = R.pick(['name', 'partnerPackage', 'landingPage'])(response[3].result);
                   const permissionsFlags: any = response[4].result;


                   // TODO [kmc] check if ks should be stored in appUser and remove direct call to http configuration
                   this.kalturaServerClient.ks = ks;
                   this.appUser.ks = ks;
                   this.appUser.permissions = permissions;
                   this.appUser.permissionsFlags = permissionsFlags ? permissionsFlags.split(',') : [];
                   this.appUser.partnerInfo = new PartnerInfo(partnerProperties.name, partnerProperties.partnerPackage, partnerProperties.landingPage) ;
                   Object.assign(this.appUser, generalProperties);

                   const value = `${ks}`;
                   this.appStorage.setInSessionStorage('auth.login.ks', value);  // save ks in session storage

                   this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedIn);

                   return true;
               }else
               {
                   // TODO [kmc] temoprary implementation
                   throw new Error("Incorrect email or password");
               }
           }
       ));
    }

    isLogged(){
        return this._appAuthStatus.getValue() === AppAuthStatusTypes.UserLoggedIn;
    }

    logout() {
        this.appUser.ks = null;
        this.kalturaServerClient.ks = null;

        this.appStorage.removeFromSessionStorage('auth.login.ks');

        this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
    }


    public loginAutomatically() : Observable<boolean>
    {
        return Observable.create((observer : any) =>
        {
           if (this._appAuthStatus.getValue() === AppAuthStatusTypes.UserLoggedOut) {
               const loginToken = this.appStorage.getFromSessionStorage('auth.login.ks');  // get ks from session storage
               if (loginToken) {
                   const requests = [
                       new UserGetAction({
                           ks : loginToken
                       }),
                       new PermissionListAction(
                           {
                               ks : loginToken,
                               filter :new KalturaPermissionFilter({
                                   nameEqual : 'FEATURE_DISABLE_REMEMBER_ME'
                               })
                           }
                       ),
                       new PartnerGetInfoAction({
                           ks : loginToken
                       })
                           .setDependency(['id',0,'partnerId']),
                       <any>new PermissionGetCurrentPermissionsAction({
                           ks : loginToken // we must set the ks manually, only upon successful result we will update the global module
                       })
                   ];

                   return this.kalturaServerClient.multiRequest(requests).map(
                       (results) =>
                       {
                           // TODO [kmc] this logic is duplicated to the login process.
                               const generalProperties = R.pick(['id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'])(results[0].result);
                               const permissions = R.map(R.pick(['id', 'type', 'name', 'status']))(results[1].result.objects);
                               const partnerProperties: any = R.pick(['name', 'partnerPackage', 'landingPage'])(results[2].result);
                               const permissionsFlags: any = results[3].result;

                               this.appUser.ks = loginToken;
                               this.appUser.permissions = permissions;
                               this.appUser.permissionsFlags = permissionsFlags ? permissionsFlags.split(',') : [];
                               this.appUser.partnerInfo = new PartnerInfo(partnerProperties.name, partnerProperties.partnerPackage, partnerProperties.landingPage) ;
                               Object.assign(this.appUser, generalProperties);

                               this.appStorage.setInSessionStorage('auth.login.ks', loginToken);  // save ks in session storage

                           return true;
                           }).subscribe(
                           () =>{
                               this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedIn);
                               observer.next(true);
                               observer.complete();
                           },
                           () => {
                               observer.next(false);
                               observer.complete();
                               this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
                           }
                   );
               }else {
                   observer.next(false);
                   observer.complete();
                   this._appAuthStatus.next(AppAuthStatusTypes.UserLoggedOut);
               }
           }
        });
    }
}