import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router  } from '@angular/router';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['./trial.component.scss']
})
export class TrialComponent implements OnInit {

    constructor( private route: ActivatedRoute, private userSvc : UserService, private router : Router ) { }
    public plan:string;
    ngOnInit() {

    }

    trial(){
      console.log("Enrolling in Trial");
      var userid = this.route.snapshot.queryParams["userid"];
      var customerid = this.route.snapshot.queryParams["customerid"];
      this.userSvc.subscribeForTrial(userid,customerid);
      this.router.navigate(['/home/list']);
    }
}
