import { Router } from 'express';
import Cookies from 'cookies';
import Twitter from '@alkihis/twitter-lite';
import { CONSUMER_APP, CONSUMER_APP_SECRET } from './constants';

const route = Router();

route.get('/', (req, res) => {
  const cookies = new Cookies(req, res);
  cookies.set('access_token', { expires: new Date('2000-01-01') });
  cookies.set('access_token_secret', { expires: new Date('2000-01-01') });

  const client = new Twitter({ 
    consumer_key: CONSUMER_APP, 
    consumer_secret: CONSUMER_APP_SECRET, 
  });

  (async () => {
    const request = await client.getRequestToken('http://localhost:2501/t_callback');
    const { oauth_token, oauth_token_secret } = request;

    cookies.set('oauth_secret', oauth_token_secret as string, { expires: new Date('2099-01-01') });

    res.send(`
      <a href="https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}">Click here to login</a>
    `);
  })().catch(e => {
    res.send(400).send('Unable to get keys. Please check request and tokens.');
    console.error(e);
  });
});

export default route;

 