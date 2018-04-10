import { Injectable } from '@angular/core';
@Injectable()
export class ConfigService {

  get(key:string) : any {
    return window["config"]["app"][key];
  }
}
