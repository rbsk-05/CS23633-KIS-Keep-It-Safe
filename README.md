# KIS – Keep It Safe 🔐

**KIS (Keep It Safe)** is a premium, modern, and highly secure Personal Password Manager. Built with the philosophy of minimal design and robust security, KIS allows you to seamlessly store, manage, and update your sensitive credentials with absolute peace of mind.

## 🌟 Key Features

- **Store & Manage Passwords**: Securely add, view, update, and delete credentials.
- **Copy to Clipboard**: Seamless 1-click password copying.
- **Show/Hide Credentials**: Toggle password visibility securely.
- **SaaS Inspired UI/UX**: Clean Light and Dark modes adorned with luxurious Gold accents.
- **AWS Hosted UI Integration**: Robust authentication natively handled through Amazon Cognito without manual token entry.
- **Encrypted Backend**: Enterprise-grade infrastructure ensuring your vault remains impenetrable.

---

## 🏗️ How It Works

1. **Authentication:** The user logs in via the robust Amazon Cognito Hosted UI.
2. **Token Exchange:** Upon successful login, the application securely retrieves and validates the JWT `access_token` and `id_token` in the background.
3. **Data Retrieval:** The Dashboard securely calls the AWS API Gateway to fetch your personalized, encrypted password vault from DynamoDB.
4. **CRUD Operations:** Users can Create, Read, Update, or Delete passwords. Every operation passes through API Gateway to AWS Lambda functions, which process the encrypted data and apply changes directly to the database.
5. **Session Management:** Built-in Axios interceptors continuously monitor token validity, triggering a graceful, automatic logout if a `401 Unauthorized` token expiration occurs.

---

## 🛠️ Tech Stack & Cloud Infrastructure

### Frontend
- **Framework:** React.js (Bootstrapped with Vite)
- **Routing:** React Router DOM (Protected & Public routes)
- **Styling:** Vanilla CSS (Context-based Light/Dark Theme variables)
- **Animations:** Framer Motion (for modals and layout transitions)
- **HTTP Client:** Axios (Interceptors for Bearer token injection)

### AWS Cloud Services
The application relies on advanced Amazon Web Services (AWS) to ensure secure storage, scalability, and reliable operations:
- **Amazon S3:** Securely stores encrypted password backups and user data files.
- **Amazon DynamoDB:** NoSQL database storing user credentials and metadata in a highly scalable and fast manner.
- **AWS EC2 / Elastic Beanstalk:** Hosts the backend application layers and handles high-throughput API requests.
- **AWS KMS (Key Management Service):** Manages encryption keys, ensuring sensitive vault data is cryptographically secure.
- **AWS IAM (Identity and Access Management):** Controls granular access and permissions for all internal AWS resources to maintain isolated security.
- **Amazon CloudWatch:** Monitors application performance, detailed logs, and system health activity.

---

## 🛡️ Security Considerations

Security is at the heart of KIS:
- **Zero-Knowledge Architecture:** The frontend never exposes hardcoded tokens; everything routes securely through Cognito.
- **In-transit Encryption:** All HTTP traffic is forced over TLS/SSL (HTTPS) ensuring data cannot be intercepted.
- **At-rest Encryption:** All sensitive data is encrypted before being written to DynamoDB or S3 using AWS KMS.
- **Strict IAM Policies:** IAM ensures heavily restricted, least-privilege controlled access between AWS services.

---

## 🚀 Installation Instructions

### Prerequisites
- Node.js (v16.0 or higher)
- NPM or Yarn
- Valid AWS Cognito Client ID & Domain (Set up in `AuthContext.jsx`)

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/rbsk-05/KIS-Keep-It-Simple.git
   cd KIS-Keep-It-Simple
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📘 Usage Guide

1. **Login:** Click "Login with AWS Cognito". You will be safely redirected to the AWS Hosted UI.
2. **Dashboard:** Once authenticated, you will see your vault. Toggle Light/Dark mode using the top-right navigation icon.
3. **Add Entry:** Use the top panel to add the Site, your Username, and your Password. Click "Add Password".
4. **Edit Entry:** Find the specific credential card, click "Edit", modify your inputs in the pop-up modal, and hit "Save Changes".
5. **Delete Entry:** Click the "Delete" trash icon on a card to immediately remove the entry from your AWS vault.

---

## 📂 Project Structure

```text
KIS-Keep-It-Simple/
├── public/                 # Static public assets
├── src/
│   ├── components/
│   │   ├── layout/         # Persistent UI structures (Navbar, Layout wrappers)
│   │   └── ui/             # Reusable UI primitives (Buttons, Inputs, Cards, ui.css)
│   ├── context/            # Global React states (AuthContext, ThemeContext)
│   ├── pages/              # Primary route views (Login, Dashboard)
│   ├── services/           # External integrations (api.js containing all Axios logic)
│   ├── App.jsx             # React Router definitions and route protection
│   ├── index.css           # Global reset and thematic CSS variables
│   └── main.jsx            # Entry point bridging Context Providers
├── index.html              # Core HTML template
├── package.json            # Deployment scripts & dependencies
├── vite.config.js          # Vite build configurations
└── README.md               # You are here!
```

---

## ✨ Future Improvements

- [ ] Implement robust multi-factor authentication (MFA).
- [ ] Add a secure password generator tool within the Add/Edit form.
- [ ] Incorporate vault synchronization across multiple devices via WebSockets.
- [ ] Perform detailed security audits and potential SOC2 compliance alignments.

---

## 👨‍💻 Author

Built and maintained with ❤️ for maximum security and simplicity.
*Repository:* [rbsk-05/KIS-Keep-It-Simple](https://github.com/rbsk-05/KIS-Keep-It-Simple)
