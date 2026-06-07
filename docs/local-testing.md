# Local Database Reset and Seed Testing Guide

This document describes how to reset your local PostgreSQL database, seed it, and verify the main functional flows in StudioOps under a clean state.

---

## 1. Stop the Backend Server
If the Spring Boot backend server is currently running, stop it by pressing `Ctrl + C` in the terminal where it was started.

---

## 2. Run the Reset Script
Run the Makefile helper target or execute the script directly from the project root:

```bash
make reset-local-db
```

Or run the script directly:
```bash
./scripts/dev/reset-local-db.sh
```

### Safety Features
- **Host Check**: The script will refuse to run if the DB host configuration is not `localhost` or `127.0.0.1`.
- **Warning Message**: Displays a clear warning:
  `WARNING: This will permanently delete all local StudioOps data.`
- **Explicit Confirmation**: Prompts you to type exactly:
  `RESET LOCAL DB`
  to proceed.

---

## 3. Restart the Backend & Apply Flyway Migrations
Once the database schema is cleared, start the Spring Boot application. Flyway will automatically run all database migrations up to `V39`:

```bash
cd backend
./mvnw spring-boot:run
```

### Health Check
Ensure that the backend is fully operational:
```bash
curl http://localhost:8080/api/health
```
*(Should return a successful status check).*

---

## 4. Clear Browser State
Before testing, open your browser's Developer Tools and clear:
- Local Storage / Session Storage.
- Cookies (specifically `JSESSIONID`).
- Cache.

---

## 5. Login as the Seeded Owner
1. Open the frontend in your browser (typically `http://localhost:5173`).
2. Login with the seeded development owner credentials:
   - **Email**: `owner@studioops.local`
   - **Password**: `ChangeMe123!`

---

## 6. Test Employee Invite Flow
Under a fresh database state, you can verify creation and invitation:
1. Navigate to the **Employees / Team** section.
2. Click **Add Team Member**.
3. Input the following test details:
   - **Full Name**: `Editor Local Fresh`
   - **Email Address**: `editor.local.fresh@gmail.com`
   - **Phone Number**: `+919800009001`
   - **Primary Role**: `Photo Editor / Editor`
   - **Skills**: `Portrait Editing, Lightroom, Photoshop`
   - **Login Email**: `editor.local.fresh@gmail.com`
   - **User Role**: `Editor`
   - **Send email invitation**: Checked
4. Click **Add Team Member**.
5. Check that the employee is successfully created.
   - If your mail server is disabled (`STUDIOOPS_EMAIL_ENABLED=false` or mocked), you will see an inline warning alert indicating the invite email was skipped or failed.
   - Check the `system_email_log` database table to confirm that the log has been written with status `FAILED` or `SENT`.

---

## 7. Test Accept Invite Flow
1. Check the database `users` table for the generated `invite_token` on the newly created user:
   ```sql
   SELECT invite_token FROM users WHERE email = 'editor.local.fresh@gmail.com';
   ```
2. Navigate to the invitation activation URL:
   `http://localhost:5173/#/accept-invite?token=<INVITE_TOKEN_FROM_DB>`
3. Set a new password and submit.
4. Verify you can now log in using `editor.local.fresh@gmail.com` and the new password.

---

## 8. Test Forgot / Reset Password Flow
1. Log out.
2. Click the **Forgot password?** link on the login page.
3. Submit `editor.local.fresh@gmail.com`.
4. Locate the `password_reset_token` from the database `users` table:
   ```sql
   SELECT password_reset_token FROM users WHERE email = 'editor.local.fresh@gmail.com';
   ```
5. Navigate to:
   `http://localhost:5173/#/reset-password?token=<PASSWORD_RESET_TOKEN>`
6. Enter a new password and submit.
7. Verify you can log in with the updated password.

---

## 9. Test Duplicate Email Validation
To verify the refined validation fix:
1. Try to create another employee with the login email `owner@studioops.local`.
2. Confirm the save is blocked with the message:
   `This email is already used by another user. Use a different login email.`
3. Edit the existing `Editor Local Fresh` employee.
4. Keeping the same login email (`editor.local.fresh@gmail.com`) and saving should succeed without duplicate user block.
5. Change the login email to `new.editor@gmail.com` (unused) -> should save successfully.
6. Try changing it to `owner@studioops.local` -> should be blocked with the exact error message:
   `This email is already used by another user. Use a different login email.`

---

## 10. Test CRM WhatsApp-Only Follow-Up Flow
1. Navigate to the **Follow-up Center** or **Clients**.
2. Click on a Lead to open details.
3. Trigger a follow-up action.
4. StudioOps operates a WhatsApp-only communication policy for leads. Ensure that:
   - System email options are **not** present for lead communication.
   - Triggering a follow-up prompts or redirects you to a WhatsApp chat window with pre-filled message text.
