import { JWTPayload, KeyLike, SignJWT, importJWK, jwtVerify }  from 'jose';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { IEnvVars, getEnvVars } from './variables';

const create_jwt_claims = (subject: string, vars: IEnvVars): JWTPayload => {
  const authTime: Date = new Date();
  const IDP_USER_GUID: string = "b5ecdb094dfb4149a6a8445a0mangled";
  const COGNITO_USERNAME: string = `test-idir_${IDP_USER_GUID}@idir`;

  return {
      "sub": subject,
      "cognito:groups": [
        "SPAR_SPR_TREE_SEED_CENTRE_ADMIN_00012797",
        "SPAR_SPR_NONMINISTRY_ORCHARD_00122360"
      ],
      "iss": `https://cognito-idp.${vars.region}.amazonaws.com/${vars.userPoolId}`,
      "version": 2,
      "client_id": vars.clientId,
      "origin_jti": "9aac7342-78ca-471b-a027-9f6daf3b923b",
      "token_use": "access",
      "scope": "openid profile",
      "auth_time": authTime,
      "exp": new Date().setMinutes(authTime.getMinutes() + 30),
      "iat": authTime.getTime(),
      "jti": "6ab8647c-0679-4d25-a71a-2400966fea9a",
      "username": COGNITO_USERNAME,
      "custom:idp_name": "idir",
      "cognito:username": COGNITO_USERNAME,
      "custom:idp_username": "BACKENDER",
      "custom:idp_user_id": "D4C2C0D1EBE34A11996BB0A506AB705B",
      "custom:idp_display_name": "Backender, REST WLRS:EX",
      "email": "rest.backender@gov.bc.ca",
      "identities": [
        {
          "userId": subject,
          "providerName": "TEST-IDIR",
          "providerType": "OIDC",
          "issuer": "http://localhost:3000",
          "primary": true,
          "dateCreated": authTime.getTime()
        }
      ]
  };
};

const create_jwt_token = async (privateJwkKey: KeyLike | Uint8Array, vars: IEnvVars): Promise<string> => {
  const subject = "51b661cf-4109-4616-b7a5-178daf51fc12";
  const claims: JWTPayload = create_jwt_claims(subject, vars);
  const signed: SignJWT = new SignJWT(claims);

  signed.setProtectedHeader({ alg: "RS256", typ: "JWT", kid: subject });
  signed.setSubject(subject);
  signed.setIssuer(`https://cognito-idp.${vars.region}.amazonaws.com/${vars.userPoolId}`);
  signed.setIssuedAt();
  signed.setExpirationTime("30min");
  signed.setAudience(["http://localhost:8090/api/genetic-classes"]);
  return signed.sign(privateJwkKey);
};

const app = express();
app.use(express.json());
const port = 3000;

// set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.get('/create-token', async (req: Request, res: Response) => {
  if (!process.env.COGNITO_REGION) {
    res.status(400)
      .json({"message": "Please define the environment variable: COGNITO_REGION!"});
  } else if (!process.env.COGNITO_USER_POOL_ID) {
    res.status(400)
      .json({"message": "Please define the environment variable: COGNITO_USER_POOL_ID!"});
  } else if (!process.env.COGNITO_CLIENT_ID) {
    res.status(400)
      .json({"message": "Please define the environment variable: COGNITO_CLIENT_ID!"});
  }

  const envVars: IEnvVars = {
    clientId: process.env.COGNITO_CLIENT_ID,
    region: process.env.COGNITO_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
  };

  // Generated at https://mkjwk.org/
  const privateKey = process.env.PRIVATEKEY;
  if (!privateKey) {
    res.status(400)
      .json({"message": "Please define the environment variable: PRIVATEKEY!"});
  }

  const privateJwkKey: KeyLike | Uint8Array = await importJWK(JSON.parse(privateKey), "RS256");

  const token = await create_jwt_token(privateJwkKey, envVars);
  res.status(200).json(token);
});

app.post('/validate-token', limiter, async (req: Request, res: Response) => {
  const bodyToken = req.body.token;
  if (!bodyToken) {
    res.status(400).json("Please send the token in the request body!");
  }

  const envVars: IEnvVars = getEnvVars();

  if (!envVars.region) {
    res.status(400).json("Please define the environment variable: COGNITO_REGION!");
  } else if (!envVars.userPoolId) {
    res.status(400).json('Please define the environment variable: COGNITO_USER_POOL_ID!');
  } else if (!envVars.clientId) {
    res.status(400).json('Please define the environment variable: COGNITO_CLIENT_ID!');
  }

  const publicKey = process.env.PUBLICKEY;
  if (!publicKey) {
    res.status(400)
      .json({"message": "Please define the environment variable: PUBLICKEY!"});
  }

  const publicJwkKey: KeyLike | Uint8Array = await importJWK(JSON.parse(publicKey), "RS256");
  const { payload, protectedHeader } = await jwtVerify(bodyToken, publicJwkKey, {
    issuer: `https://cognito-idp.${envVars.region}.amazonaws.com/${envVars.userPoolId}`,
    audience: ["http://localhost:8090/api/genetic-classes"]
  });

  res.status(200).json({
    payload,
    protectedHeader
  });
});

app.get('/jwks-json', (req: Request, res: Response) => {
  const publicKey = process.env.PUBLICKEY;
  if (!publicKey) {
    res.status(400)
      .json({"message": "Please define the environment variable: PUBLICKEY!"});
  }

  const famKeys = process.env.FAMKEYS;
  if (!famKeys) {
    res.status(400)
      .json({"message": "Please define the environment variable: FAMKEYS!"});
  }

  res.json({
    "keys": [
      JSON.parse(publicKey),
      ...JSON.parse(famKeys)
    ]
  });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
