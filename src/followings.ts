import { Router } from 'express';
import Cookies from 'cookies';
import Twitter from '@alkihis/twitter-lite';
import { CONSUMER_APP, CONSUMER_APP_SECRET } from './constants';
import { FullUser } from 'twitter-d';

const route = Router();

interface Friends {
  users: FullUser[],
  previous_cursor: number,
  previous_cursor_str: string,
  next_cursor: number,
  next_cursor_str: string,
}

route.get('/', (req, res) => {
  const cookies = new Cookies(req, res);

  const access_token = cookies.get('access_token');
  const access_token_secret = cookies.get('access_token_secret');

  const client = new Twitter({ 
    consumer_key: CONSUMER_APP, 
    consumer_secret: CONSUMER_APP_SECRET, 
    access_token_key: access_token as string, 
    access_token_secret: access_token_secret as string,
  });

  if (!access_token|| !access_token_secret) {
    res.status(400).send('Unable to verifier sent keys. please login again');
    return;
  }

  (async () => {
    const friends: FullUser[] = [];

    let friend_count = Infinity;
    let cursor: string | undefined = undefined;

    while (friend_count && cursor !== '0' && cursor !== '-1') {
      const options: any = { 
        count: 200, 
        screen_name: 'wydrops', 
        skip_status: false, 
        tweet_mode: 'extended', 
        include_user_entities: true,
      };
      if (cursor) {
        options.cursor = cursor;
      }

      const current_friends: Friends = await client.get('friends/list', options);
      // console.log(current_friends);

      friend_count = current_friends.users.length;
      cursor = current_friends.next_cursor_str;
      friends.push(...current_friends.users);
    }

    friends.sort((a, b) => {
      if (!a.status) {
        return 1;
      }
      if (!b.status) {
        return -1;
      }

      const atweet_date = new Date(a.status!.created_at);
      const btweet_date = new Date(b.status!.created_at);

      return +atweet_date - +btweet_date;
    });

    let res_str = '';

    for (const friend of friends) {
      res_str += `${friend.name} — ${friend.screen_name} : Dernier tweet le ${friend.status ? new Date(friend.status!.created_at).toISOString() : '(jamais)'}\n`;
    }

    res.send(`
      <html>
        <body>
          <pre>
            ${res_str}
          </pre>
        </body>
      </html>
    `);
  })().catch(e => {
    console.error(e);
    res.status(400).send('Unable to get keys. Please check request and tokens. if the problem persists, <a href="/login">login again</a>.');
  });
});

export default route;

 