import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    loading = false;
    error = '';

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.loading = true;
        this.error = '';
        const { username, password } = this.loginForm.value;

        this.authService.login({ username: username!, password: password! })
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: () => {
                    this.error = 'Invalid credentials';
                    this.loading = false;
                }
            });
    }
}
