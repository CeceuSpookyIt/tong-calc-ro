import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  constructor(private readonly router: Router) {}

  ngOnInit() {
    // Supabase handles the OAuth callback automatically via onAuthStateChange.
    // Just redirect to home.
    this.router.navigate(['/']);
  }
}
