import Cookies from 'cookies';
import express from 'express';
import TwitterCallback from './callback';
import TwitterFollowings from './followings';
import TwitterLogin from './login';

const app = express();

app.use('/t_callback', TwitterCallback);
app.use('/followings', TwitterFollowings);
app.use('/login', TwitterLogin);

app.get('/', (req, res) => {
  const cookies = new Cookies(req, res);

  if (cookies.get('access_token')) {
    return res.redirect('/followings');
  }
  return res.redirect('/login');
});

app.listen(2501, () => {
  console.log("Listening on port 2501");
});

