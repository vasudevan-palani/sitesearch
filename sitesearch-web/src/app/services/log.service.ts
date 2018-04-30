import { Injectable } from '@angular/core';
@Injectable()
export class LogService {

  debug(...args){
    console.debug(args);
  }

  info(...args){
    console.info(args);
  }

  warn(...args){
    console.warn(args);
  }

  error(...args){
    console.error(args);
  }
}
