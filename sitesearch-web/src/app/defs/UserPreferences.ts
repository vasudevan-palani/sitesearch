import { UserAccount } from 'app/defs/UserAccount';
import { UserSubscription } from 'app/defs/UserSubscription';

export class UserPreferences {
  planId : string;
  planName : string;

  // Stripe customerid
  //
  customerId : string;

  //
  account : UserAccount;

  card : any;
}
