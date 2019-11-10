#!/usr/bin/env node
import * as trivium from "./trivium";
import * as fs from "fs";
import * as readline from "readline";
import * as util from "util";

const readFile = util.promisify(fs.readFile);

const args = process.argv.slice(2);
const filename = args[0];

async function processFile(filename: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = (query: string) => {
    return new Promise((resolve: (answer: string) => void) => {
      rl.question(query, resolve);
    });
  };

  console.log(`Encriptando ${filename}`);

  const key = await question("Ingrese la clave ultrasecreta: ");
  console.log(`Clave: ${key}`);

  const iv = await question("Ingrese el IV: ");
  console.log(`IV: ${iv}`);

  const file = await readFile(filename);

  file.forEach(console.log);
}

processFile(filename);