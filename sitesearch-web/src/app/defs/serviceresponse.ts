export class ServiceResponse {
  code:string;
  message ?: string;
  severity ?: ServiceResponseErrorCategory;
  data : any;

  constructor(){
    this.code = "";
    this.message = "";
    this.severity = ServiceResponseErrorCategory.ERROR;
  }
}

enum ServiceResponseErrorCategory {
  WARNING,
  ERROR
}
