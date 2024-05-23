import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import express, { type Express, type Request, type Response } from 'express';

const PORT = 5000;
const app: Express  = express();

app.use(express.json());
app.use(express.static('public'));

//Types
interface IUserStore {
    [key: string]: Object;
}
interface IUser {
    id: string;
    username: string;
    password: string;
    passkey?: Object;
}
interface IChallengeStore {
    [key: string]: string;
}

//Inmemory database
const userStore: IUserStore = {};
const challengeStore: IChallengeStore = {};

//Routes for Register
app.post('/register', (req: Request, res: Response) => {
        const { username, password } = req.body;
        const id: string = `user_${Date.now()}`;
        const user: IUser = { id, username, password };
        userStore[id] = user;

        console.log(`User registered with id: ${id}`);
    
        res.json({ id });
});

//Routes for generating challenge and sending to client
app.post('/register-challenge', async (req: Request, res: Response) => {
    const {userId} = req.body;
    if(!userStore[userId]) return res.status(404).json({error: 'User not found'});
    //Get user from userStore
    const user: IUser = userStore[userId] as IUser;
    //Generate challenge
    const challengePayload = await generateRegistrationOptions({
        rpID: 'localhost',
        rpName: 'SimpleWebAuthn',
        userName: user.username,
    });
    //Store challenge
    challengeStore[userId] = challengePayload.challenge;

    //Send challenge to client
    res.json({options: challengePayload});
});

//Routes for verifying challenge and storing public key
app.post('/register-verify',async (req: Request, res: Response) => {
    const {userId, credential} = req.body;
    if(!userStore[userId]) return res.status(404).json({error: 'User not found'});
    if(!challengeStore[userId]) return res.status(404).json({error: 'Challenge not found'});

    //Get user from userStore
    const user: IUser = userStore[userId] as IUser;
    //Get challenge from challengeStore
    const challenge = challengeStore[userId];

    //Verify challenge
    const verificationResult = await verifyRegistrationResponse({
        expectedChallenge: challenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        response: credential,
    });

    if(!verificationResult.verified) return res.status(400).json({error: 'Verification failed'});
    
    //Store public key
    (userStore[userId] as IUser).passkey = verificationResult.registrationInfo;
    
    res.json({verified : true});
});

//Routes for Login challenge
app.post('/login-challenge', async (req: Request, res: Response) => {
    const {username} = req.body;
    const userId = Object.keys(userStore).find(userId => (userStore[userId] as IUser).username === username);
    if(!userId) return res.status(404).json({error: 'User not found'});
    if(!userStore[userId]) return res.status(404).json({error: 'User not found'});

    const options = await generateAuthenticationOptions({
        rpID: 'localhost',
    });
    challengeStore[userId] = options.challenge;
    res.json({options});
});

//Routes for verifying login challenge
app.post('/login-verify', async (req: Request, res: Response) => {
    const {username, credential} = req.body;
    const userId = Object.keys(userStore).find(userId => (userStore[userId] as IUser).username === username);
    if(!userId) return res.status(404).json({error: 'User not found'});
    if(!challengeStore[userId]) return res.status(404).json({error: 'Challenge not found'});

    const user = userStore[userId] as IUser;
    const passKey = user.passkey;
    if(!passKey) return res.status(400).json({error: 'User not registered'});


    const challenge = challengeStore[userId];
    const verificationResult = await verifyAuthenticationResponse({
        expectedChallenge: challenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        response: credential,
        authenticator: passKey as any,
    })

    if(!verificationResult.verified) return res.status(400).json({error: 'Verification failed'});
    
    res.json({success : true, userId});
});

// run server in lan network
app.listen(PORT as number, '192.168.10.87', () => {
    console.log(`Server started at http://192.168.10.87:${PORT}`);
});