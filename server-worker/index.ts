import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ZkappClient from "./zkapp/pollClient.js";

dotenv.config();

const zkappClient = new ZkappClient();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/status", (req: Request, res: Response) => {
  res.send(zkappClient.status());
});

app.get("/addInstance/", (req: Request, res: Response) => {
  const data = req.body;
  zkappClient.setupZkappInstance(''); // TODO: this only works with local chain
  res.send('');
});

app.get('/:publicKey/ipfsHash', (req: Request, res: Response) => {
  const publicKey = req.params.publicKey;
  const ipfsHash = zkappClient.getIpfsHash(publicKey);
  res.send(ipfsHash);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

zkappClient.setup();