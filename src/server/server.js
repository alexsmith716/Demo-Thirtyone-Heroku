import path from 'path';
import express from 'express';
import { createServer } from 'http';
import * as renderer from './renderer';
import { getUserAgent } from '../utils/device';
import { isBot } from '../utils/device';
const port = process.env.PORT;

export function startServer() {

  const app = express();

  app.set('port', port);

  app.use((req, res, next) => {
    console.log(`>>>>>>>>>>>>>>>>> START > REQUEST IN <<<<<<<<<<<<<<<<<<<<<<<`);
    console.log(`>>>>>>>>>>>>>>>>> START > REQ.method +++++++++++++++: ${req.method}`);
    console.log(`>>>>>>>>>>>>>>>>> START > REQ.url ++++++++++++++++++: ${req.url}`);
    console.log(`>>>>>>>>>>>>>>>>> START > REQ.path ++++++++++++++++++: ${req.path}`);
    console.log(`>>>>>>>>>>>>>>>>> START > REQ.originalUrl ++++: ${req.originalUrl}`);
    console.log(`>>>>>>>>>>>>>>>>> START > REQUEST OUT <<<<<<<<<<<<<<<<<<<<<<<`);
    next();
  });

  // =====================================================

  app.use(express.static('dist/client'));
  
  app.use((req, res, next) => {
    req.userAgent = getUserAgent(req.headers['user-agent']);
    req.isBot = isBot(req.headers['user-agent']);
    next();
  });

  app.get('*', (req, res, next) => { 
      console.log('>>>> SERVER > RENDERER !!!! ===========================');
      next();
    }, renderer.get
  );

  // =====================================================

  const server = createServer(app);

  server.listen(app.get('port'), () => {
    console.log(`Listening on 8080 ++++++++++++++++++`);
  });
  
  return app;
}
