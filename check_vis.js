const https = require('https');

const options = {
  hostname: 'api.sanity.io',
  path: '/v2021-06-07/projects/dp651wdk/datasets/production',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer skFNN4TfWgk0fiiof8ES7Gz4ylBbNmi0O4JJG9zF2Zi9QIjC9xpU2yv9Acb0cAxkySqlNgfT4bT8wsLwiNdsjpUQe7qSgIrUMVnzkvWWkqPo0DDuYkUtzOnIXH6tDlYx3vkGKcB4Z4OqtMO9l5UhACrDzpjZgYyGvmjriGqLVC7BueUpYw2S'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});
req.on('error', e => console.error(e));
req.end();
