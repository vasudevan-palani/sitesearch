import { UserAccountStatus } from 'app/defs/UserAccountStatus';
import { TrialData } from 'app/defs/trialdata';
import { UserSubscription } from 'app/defs/usersubscription';

export class UserAccount {
  public status : UserAccountStatus;
  public trial : TrialData;

  public subscription : UserSubscription;

  isNew(){
    return this.status!= undefined  && this.status == UserAccountStatus.NEW;
  }

  isSuspended(){
    return this.status!= undefined  && this.status == UserAccountStatus.SUSPENDED;
  }

  isActivated(){
    return this.status!= undefined  && this.status == UserAccountStatus.ACTIVATED;
  }

  isTrial(){
    return this.status!= undefined  && this.status == UserAccountStatus.TRIAL;
  }

}
