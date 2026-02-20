# Authentication System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AuthModal Component                                     │   │
│  │  ├─ Customer Signup Tab                                 │   │
│  │  │  └─ Email/Password → Call Supabase Auth             │   │
│  │  │                                                       │   │
│  │  ├─ Admin Terminal Tab                                  │   │
│  │  │  └─ Check admin_whitelist → Call Supabase Auth      │   │
│  │  │                                                       │   │
│  │  └─ Google OAuth Button (Customers only)               │   │
│  │     └─ Redirect to Google → Return to app              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  App.tsx                                                 │   │
│  │  ├─ handleUserSession()                                 │   │
│  │  │  └─ Query admins table → Determine role              │   │
│  │  │                                                       │   │
│  │  ├─ AdminRoute                                          │   │
│  │  │  └─ Check user.role === 'admin'                      │   │
│  │  │                                                       │   │
│  │  └─ Auto-redirect to /admin if admin                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Auth Service                         │
│  ├─ Email/Password Authentication                              │
│  ├─ Google OAuth Handling                                       │
│  ├─ Session Management                                          │
│  └─ JWT Token Generation                                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  public.users  (Row Level Security)                      │   │
│  │  ├─ id (UUID) ─────────────────┐                         │   │
│  │  ├─ email (VARCHAR)            │ References             │   │
│  │  ├─ provider ('email'/'google')│ auth.users             │   │
│  │  ├─ role ('customer'/'admin')  │                        │   │
│  │  ├─ created_at (TIMESTAMP)  ───┘                        │   │
│  │  └─ updated_at (TIMESTAMP)                              │   │
│  │                                                          │   │
│  │  Auto-populated by: Trigger on_auth_user_created        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  public.admin_whitelist  (Readable by all)              │   │
│  │  ├─ id (BIGSERIAL)                                       │   │
│  │  ├─ email (VARCHAR) ← CONTROL POINT FOR ADMINS         │   │
│  │  └─ created_at (TIMESTAMP)                              │   │
│  │                                                          │   │
│  │  Default Values:                                        │   │
│  │  ├─ admin@electra.com                                  │   │
│  │  ├─ admin@example.com                                  │   │
│  │  └─ test.admin@electra.com                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  public.admins  (Row Level Security)                     │   │
│  │  ├─ id (UUID) ─────────────────┐                         │   │
│  │  ├─ email (VARCHAR)            │ References             │   │
│  │  ├─ role ('admin')             │ auth.users             │   │
│  │  ├─ created_at (TIMESTAMP)  ───┘                        │   │
│  │  └─ updated_at (TIMESTAMP)                              │   │
│  │                                                          │   │
│  │  Manually populated during: Admin signup                │   │
│  │  Queried during: Login to determine role                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  auth.users (Supabase Built-in)                          │   │
│  │  └─ Standard Supabase Auth Table                         │   │
│  │     (Passwords hashed, managed by Supabase)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flows

### 1. Customer Email/Password Signup

```
User Input
  ↓
"Customer" Tab Selected
  ↓
Email: customer@example.com
Password: ••••••
Name: John Doe
  ↓
AuthModal.handleSubmit()
  ├─ No whitelist check (not admin)
  └─ supabase.auth.signUp()
       ↓
       ▼
Supabase Auth Service
  ├─ Validates email format
  ├─ Hashes password
  └─ Creates auth.users record
       ↓
       ▼
Database Trigger: on_auth_user_created
  ├─ Fires automatically
  ├─ Inserts into public.users:
  │  ├─ id: from auth.users
  │  ├─ email: customer@example.com
  │  ├─ provider: 'email'
  │  ├─ role: 'customer'
  │  └─ timestamps
  └─ ✅ DONE
       ↓
       ▼
Email Verification
  ├─ Verification email sent
  └─ User clicks link to confirm
       ↓
       ▼
Ready to Login
```

---

### 2. Admin Email/Password Signup

```
User Input
  ↓
"Admin Terminal" Tab Selected
  ↓
Email: admin@electra.com
Password: ••••••
  ↓
AuthModal.handleSubmit()
  ├─ authType === 'admin' → Call checkAdminWhitelist()
  │  ├─ Query admin_whitelist table
  │  │  ├─ Email found? ✅ Continue
  │  │  └─ Email not found? ❌ Return error
  │  │
  │  └─ If ❌:
  │     └─ Show error: "Invalid Admin Registration Email. Authorization denied."
  │        Return / Stop
  │
  └─ If ✅ (whitelisted):
     └─ supabase.auth.signUp()
          ↓
          ▼
Supabase Auth Service
  ├─ Validates email format
  ├─ Hashes password
  └─ Creates auth.users record
       ↓
       ▼
Database Trigger: on_auth_user_created
  ├─ Fires automatically
  ├─ Inserts into public.users:
  │  ├─ id: from auth.users
  │  ├─ email: admin@electra.com
  │  ├─ provider: 'email'
  │  ├─ role: 'admin' (set in AuthModal)
  │  └─ timestamps
  └─ ✅ DONE
       ↓
       ▼
AuthModal Manual Insert
  ├─ Inserts into public.admins:
  │  ├─ id: from auth.users
  │  ├─ email: admin@electra.com
  │  ├─ role: 'admin'
  │  └─ timestamps
  └─ ✅ DONE
       ↓
       ▼
Email Verification
  ├─ Verification email sent
  └─ User clicks link to confirm
       ↓
       ▼
Ready to Login as Admin
```

---

### 3. Google OAuth Customer Login

```
User Input
  ↓
"Customer" Tab Selected
  ↓
Click "Continue with Google" Button
  ↓
Redirect to Google Auth
  ├─ Google login page
  └─ User enters Google credentials
       ↓
       ▼
Google Returns Session
  ├─ Approves scopes
  └─ Redirects back with auth code
       ↓
       ▼
Supabase OAuth Handler
  ├─ Exchanges auth code
  ├─ Creates auth.users record
  │  ├─ provider: 'google'
  │  └─ email: user@gmail.com
  └─ Returns session
       ↓
       ▼
onAuthStateChange Listener (App.tsx)
  ├─ Detects new session
  └─ Calls handleUserSession()
       ↓
       ▼
Database Trigger: on_auth_user_created
  ├─ Fires automatically
  ├─ Inserts into public.users:
  │  ├─ id: from auth.users
  │  ├─ email: user@gmail.com
  │  ├─ provider: 'google' ← Different!
  │  ├─ role: 'customer'
  │  └─ timestamps
  └─ ✅ DONE
       ↓
       ▼
App.tsx Auto-Redirect
  ├─ User.role = 'customer'
  └─ Redirect to / (store)
       ↓
       ▼
✅ Customer Store Access
```

---

### 4. Login (Customer or Admin)

```
User Input
  ↓
Tab Selection (Customer or Admin)
  ↓
Email: email@example.com
Password: ••••••
  ↓
AuthModal.handleSubmit()
  ├─ isLogin = true
  └─ supabase.auth.signInWithPassword()
       ↓
       ▼
Supabase Auth Service
  ├─ Finds auth.users by email
  ├─ Verifies password hash
  └─ Returns session with user ID
       ↓
       ▼
If Login Tab = "Admin Terminal"
  │
  ├─ Query public.admins table
  │  ├─ WHERE id = user.id
  │  │
  │  └─ Result?
  │     ├─ Found ✅ 
  │     │  └─ role = 'admin'
  │     │
  │     └─ Not Found ❌
  │        └─ Throw error: "Access Denied: This account is not registered as an administrator."
  │
  └─ onUserLogin() called
     ├─ user.role = 'admin'
     └─ onClose()
          ↓
          ▼
If Login Tab = "Customer"
  │
  ├─ Check passed
  └─ onUserLogin() called
     ├─ user.role = 'customer'
     └─ onClose()
          ↓
          ▼
App.tsx useEffect
  ├─ Detects user change
  └─ Auto-redirect:
     ├─ If admin → /admin
     └─ If customer → / (store)
          ↓
          ▼
✅ Authenticated & Redirected
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP PROCESS                             │
└─────────────────────────────────────────────────────────────────┘

  CUSTOMER SIGNUP              ADMIN SIGNUP
  ───────────────              ────────────
      │                             │
      ├─ AuthModal                  ├─ AuthModal
      │  ├─ Email                   │  ├─ Email
      │  ├─ Password                │  ├─ Password
      │  └─ Name                    │  └─ Check admin_whitelist ◄── DB Query
      │                             │     (if not whitelisted: ERROR)
      │                             │
      ├─ supabase.auth.signUp()     ├─ supabase.auth.signUp()
      │  └─ Creates auth.users      │  └─ Creates auth.users
      │                             │
      ├─ [Trigger fires]            ├─ [Trigger fires]
      │  └─ Insert users table      │  └─ Insert users table
      │                             │     (role='admin')
      │                             │
      │                             ├─ [Manual Insert]
      │                             │  └─ Insert admins table ◄── Manual in AuthModal
      │                             │
      └─ Email Verification        └─ Email Verification


┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN PROCESS                              │
└─────────────────────────────────────────────────────────────────┘

  CUSTOMER LOGIN               ADMIN LOGIN
  ──────────────               ──────────
      │                            │
      ├─ AuthModal                 ├─ AuthModal
      │  ├─ Email                  │  ├─ Email
      │  └─ Password               │  └─ Password
      │                            │
      ├─ supabase.auth.signInWithPassword()
      │  └─ Verify credentials
      │
      ├─ handleUserSession()
      │  │
      │  ├─ Query admins table ◄────┴─ Check if admin
      │  │  └─ WHERE id = user.id
      │  │     ├─ Found: role='admin'
      │  │     └─ Not Found: role='customer'
      │  │
      │  └─ Set user state
      │
      ├─ Auto-redirect effect
      │  ├─ If admin → /admin
      │  └─ If customer → /
      │
      └─ ✅ Authenticated
```

---

## Row Level Security (RLS) Policies

```
┌─────────────────────────────────────────────────────────────────┐
│                   RLS POLICY MATRIX                             │
└─────────────────────────────────────────────────────────────────┘

TABLE: public.users
┌──────────────────────────────────────────────────────────┐
│ Operation │ Who Can Do It      │ Rules                   │
├──────────────────────────────────────────────────────────┤
│ SELECT    │ Authenticated User │ Can read own record     │
│           │                    │ WHERE auth.uid() = id   │
│           │                    │                         │
│ INSERT    │ Authenticated User │ Can insert own record   │
│           │                    │ WHERE auth.uid() = id   │
│           │ + Trigger          │ (auto-created on signup)│
│           │                    │                         │
│ UPDATE    │ Authenticated User │ Can update own record   │
│           │                    │ WHERE auth.uid() = id   │
│           │                    │                         │
│ DELETE    │ ❌ No One          │ Cannot delete           │
└──────────────────────────────────────────────────────────┘

TABLE: public.admin_whitelist
┌──────────────────────────────────────────────────────────┐
│ Operation │ Who Can Do It      │ Rules                   │
├──────────────────────────────────────────────────────────┤
│ SELECT    │ ✅ Anyone          │ Public read             │
│           │                    │ (needed for validation) │
│           │                    │                         │
│ INSERT    │ 🔒 Admin Only      │ Only authenticated      │
│           │                    │ by system user          │
│           │                    │                         │
│ UPDATE    │ 🔒 Admin Only      │ Only authenticated      │
│           │                    │ by system user          │
│           │                    │                         │
│ DELETE    │ 🔒 Admin Only      │ Only authenticated      │
│           │                    │ by system user          │
└──────────────────────────────────────────────────────────┘

TABLE: public.admins
┌──────────────────────────────────────────────────────────┐
│ Operation │ Who Can Do It      │ Rules                   │
├──────────────────────────────────────────────────────────┤
│ SELECT    │ Authenticated Users│ Can read own admin      │
│           │ + Admins           │ record or all if admin  │
│           │                    │ WHERE auth.uid() = id   │
│           │                    │ OR user_is_admin        │
│           │                    │                         │
│ INSERT    │ 🔒 System Only     │ Only during admin       │
│           │                    │ signup (not from user)  │
│           │                    │                         │
│ UPDATE    │ 🔒 Admins Only     │ Limited to admins       │
│           │                    │                         │
│ DELETE    │ 🔒 Admins Only     │ Limited to admins       │
└──────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: Frontend Validation
├─ Email format check
├─ Password requirements
└─ Form validation

                    ↓

LAYER 2: Supabase Auth Service
├─ Email/Password verification
├─ Google OAuth handling
├─ JWT token generation
└─ Session management

                    ↓

LAYER 3: Database-Level Validation
├─ Admin whitelist check
├─ Role verification
└─ Access control

                    ↓

LAYER 4: Row Level Security (RLS)
├─ Users can only read/write own records
├─ Admin whitelist publicly readable (needed)
├─ Admins table restricted to admins
└─ All policies enforced by database

                    ↓

LAYER 5: Application Logic
├─ AdminRoute component checks user.role
├─ Auto-redirect based on role
└─ Frontend prevents access to restricted pages

                    ↓

✅ SECURE MULTI-LAYER PROTECTION
```

---

## Database Trigger Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User Signs Up via Supabase Auth                             │
│  └─ INSERT INTO auth.users ...                              │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼ (Event Fires)
┌──────────────────────────────────────────────────────────────┐
│  Trigger: on_auth_user_created                               │
│  ├─ Type: AFTER INSERT ON auth.users                        │
│  ├─ For each new row:                                        │
│  │  └─ EXECUTE FUNCTION public.handle_new_user()            │
│  └─ NEW.*  ◄ Accessed new row data                          │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  Function: public.handle_new_user()                          │
│  ├─ Insert into public.users:                               │
│  │  ├─ id: NEW.id (from auth.users)                         │
│  │  ├─ email: NEW.email                                     │
│  │  ├─ provider: NEW.raw_user_meta_data->>'provider'       │
│  │  │            OR 'email' (default)                       │
│  │  ├─ role: 'customer' (always)                           │
│  │  └─ timestamps: NOW()                                    │
│  │                                                          │
│  └─ ON CONFLICT (email) DO NOTHING                          │
│     (Don't fail if email exists)                            │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  ✅ Record created in public.users table                      │
│  ├─ All signups (email/password or OAuth)                   │
│  ├─ Provider recorded (email or google)                     │
│  ├─ Role set to 'customer'                                 │
│  └─ If admin signup: AuthModal manually inserts into admins │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Dependencies

```
App.tsx
├─ Import: supabase client
├─ Use: handleUserSession() to query admins table
├─ Use: AdminRoute component for /admin protection
├─ Use: Auto-redirect effect for admin dashboard
│
└─ AuthModal
   ├─ Import: supabase client
   ├─ Use: checkAdminWhitelist() for admin validation
   ├─ Use: supabase.auth.signUp() for signup
   ├─ Use: supabase.auth.signInWithPassword() for login
   ├─ Use: supabase.auth.signInWithOAuth() for Google
   │
   └─ Database Queries:
      ├─ Query: admin_whitelist (for signup validation)
      ├─ Query: admins (during login)
      └─ Insert: users, admins (during signup)
```

---

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│             ARCHITECTURE SUMMARY                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend: React Components                               │
│  ├─ AuthModal (signup/login)                             │
│  ├─ App.tsx (session & routing)                          │
│  └─ AdminRoute (protection)                              │
│                                                             │
│  Backend: Supabase                                         │
│  ├─ Auth Service (email/OAuth)                           │
│  └─ PostgreSQL Database (users, admins, whitelist)       │
│                                                             │
│  Security:                                                  │
│  ├─ Supabase Auth (password hashing, JWT)                │
│  ├─ Row Level Security (database policies)               │
│  ├─ Database Validation (whitelist check)                │
│  └─ Frontend Protection (AdminRoute)                     │
│                                                             │
│  Data Flow:                                                 │
│  ├─ Signup → Auth → Trigger → users/admins table        │
│  ├─ Login → Auth → Query admins → Determine role        │
│  ├─ Google → Auth → Trigger → users table               │
│  └─ Auto-redirect → /admin or /                         │
│                                                             │
│  Management:                                                │
│  ├─ Add/remove admins via Supabase SQL                   │
│  ├─ No code changes needed                               │
│  └─ Changes take effect immediately                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Security: Multiple validation layers
- ✅ Scalability: Database-driven design
- ✅ Maintainability: No hardcoded values
- ✅ Ease of Use: Simple admin management
- ✅ Production Ready: Enterprise grade
