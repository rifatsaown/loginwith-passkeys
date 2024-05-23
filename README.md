# loginwith-passkeys

## This is a simple login system that uses passkeys to authenticate users
Users can create an account and login using a passkey. The passkey is stored in a file and is used to authenticate the user.

As it is a simple project, there no database and the encryption and decryption of the passkey is handled by the `@simplewebauthn/browser` library.


To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
