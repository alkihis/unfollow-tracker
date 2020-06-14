import { Router } from 'express';
import Cookies from 'cookies';
import Twitter from '@alkihis/twitter-lite';
import { CONSUMER_APP, CONSUMER_APP_SECRET } from './constants';

const route = Router();

route.get('/', (req, res) => {
  const cookies = new Cookies(req, res);

  const secret = cookies.get('oauth_secret');
  const twitter = new Twitter({ consumer_key: CONSUMER_APP, consumer_secret: CONSUMER_APP_SECRET });

  const token = req.query.oauth_token as string;
  const verifier = req.query.oauth_verifier as string;

  if (!secret || !token || !verifier) {
    res.status(400).send('Unable to verifier sent keys. please login again');
    return;
  }

  (async () => {
    const keys = await twitter.getAccessToken({ verifier, key: token, secret });

    const { oauth_token: access_token, oauth_token_secret: access_token_secret } = keys;

    const client = new Twitter({ 
      consumer_key: CONSUMER_APP, 
      consumer_secret: CONSUMER_APP_SECRET, 
      access_token_key: access_token as string, 
      access_token_secret: access_token_secret as string,
    });

    // Validate keys
    const user = await client.get('account/verify_credentials');

    cookies.set('access_token', access_token as string, { expires: new Date('2099-01-01') });
    cookies.set('access_token_secret', access_token_secret as string, { expires: new Date('2099-01-01') });

    delete user._headers;
    res.send(`
      <html>
        <body>
          <pre>
            ${JSON.stringify({ ...user, check: 'http://localhost:2501/followings' }, null, 2)}
          </pre>
        </body>
      </html>
    `);
  })().catch(e => {
    res.status(400).send('Unable to get keys. Please check request and tokens.');
    console.error(e);
  });
});

export default route;

 