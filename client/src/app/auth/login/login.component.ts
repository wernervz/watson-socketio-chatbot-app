import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { LoopbackAuthService } from '../loopback/loopback-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public submitted: boolean; // keep track on whether form is submitted
  public isError: boolean;
  public errorMsg: string;

  public credentials: any = {
    username: '',
    password: ''
  }

  constructor(private authService: LoopbackAuthService, private router: Router) {}

  ngOnInit() {
    // Logout previous token in session storage and remove token from session storage
    let stored = this.authService.get();
    if (stored && stored.token) {
      this.authService.logout().subscribe(
        success => {
          if (success) {
            console.log('Successfully logged out...')
            this.authService.destroyToken();
          } else {
            console.log('No Token found in session storage...');
          }
        }
      )
    }
  }

  submitLogin() {
    // Reset the error
    this.isError = false;
    // Use an observable to call the server and get an async response back
    this.authService.login(this.credentials).subscribe(res => {
      console.log('Successfully logged in...')
        this.router.navigate([''])
      },
      err => {
        console.log('Login Error...');
        this.isError = true;
        this.errorMsg = err.message;
      }
    )
  }

}
