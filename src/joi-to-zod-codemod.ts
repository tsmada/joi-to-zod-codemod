import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as t from "@babel/types";
import * as fs from "fs";
import * as path from "path";

const joiToZodTransformer = (code: string): string => {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript"] });

  traverse(ast, {
    ImportDeclaration({ node }) {
      if (node.source.value === "joi") {
        node.source.value = "zod";
      }
    },
    CallExpression({ node }) {
      if (
        t.isIdentifier(node.callee) &&
        node.callee.name === "Joi" &&
        node.arguments.length > 0
      ) {
        node.callee.name = "Zod";
      }
    },
  });

  return generate(ast).code;
};

const transformFile = (filePath: string) => {
  const code = fs.readFileSync(filePath, "utf-8");
  const transformedCode = joiToZodTransformer(code);
  fs.writeFileSync(filePath, transformedCode);
};

const walkSync = (dir: string, filelist: string[] = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else if (path.extname(file) === ".ts") {
      filelist.push(filePath);
    }
  });

  return filelist;
};

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 <path> [options]')
    .demandCommand(1, 'Please provide a directory path as an argument')
    .option('path', {
      alias: 'p',
      describe: 'Path to the directory containing TypeScript files',
      type: 'string',
    })
    .help('h')
    .alias('h', 'help')
    .argv;

  const dir = argv._[0] as string;

  const tsFiles = walkSync(dir);

  tsFiles.forEach((file) => {
    transformFile(file);
  });
};

main();
