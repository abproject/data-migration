import express from 'express';
import path from 'path';

import { ServerRouter } from './api/server';
import { PipelineRouter } from './api/pipeline';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || '3000';

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/servers', ServerRouter);
app.use('/api/pipelines', PipelineRouter);

app.listen(port, err => {
  if (err) return console.error(err);
  return console.log(`Server is listening on ${port}`);
});