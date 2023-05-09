import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as t from "@babel/types";
import * as fs from "fs";
import * as path from "path";

const joiToZodTransformer = (code: string): string => {
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] });

  const joiToZodMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    date: 'date',
  };

  traverse(ast, {
    ImportDeclaration(path) {
      const node = path.node;
      if (node.source.value === 'joi') {
        node.source.value = 'zod';
        node.specifiers.forEach((specifier) => {
          if (t.isImportDefaultSpecifier(specifier)) {
            path.insertBefore(
              t.importDeclaration(
                [t.importSpecifier(t.identifier('z'), t.identifier('z'))],
                t.stringLiteral('zod')
              )
            );
            path.remove();
          } else if (
            t.isImportSpecifier(specifier) &&
            t.isIdentifier(specifier.imported) &&
            specifier.imported.name === 'Joi'
          ) {
            specifier.imported.name = 'z';
          }
        });
      }
    },
    MemberExpression(path) {
      const node = path.node;
      if (
        t.isIdentifier(node.object) &&
        node.object.name === 'Joi' &&
        t.isIdentifier(node.property) &&
        joiToZodMap.hasOwnProperty(node.property.name)
      ) {
        node.object.name = 'z';
        node.property.name = joiToZodMap[node.property.name];
      }
    },
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'optional' &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'Joi'
      ) {
        path.replaceWith(
          t.callExpression(
            t.memberExpression(path.node.callee.object, t.identifier('optional')),
            []
          )
        );      
      } else if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'required'
      ) {
        path.replaceWith(path.node.callee.object);
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
