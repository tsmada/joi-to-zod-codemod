# Joi to Zod Codemod

A TypeScript codemod that automatically transforms Joi schema validations to Zod schema validations in your codebase.

## Requirements

- Node.js v12.0.0 or higher
- npm v6.0.0 or higher

## Installation

1. Clone this repository:

```bash
git clone https://github.com/tsmada/joi-to-zod-codemod.git
```

2. Navigate to repo dir:

```bash
cd joi-to-zod-codemod
```

3. Install

```bash
npm install
```

## Usage

To run the codemod, execute the following command in your terminal, replacing <path> with the path to the directory containing your TypeScript files:

```bash
npx ts-node src/joi-to-zod-codemod.ts <path>
```

For example:
```bash
npx ts-node src/joi-to-zod-codemod.ts ./src/services
```

This will apply the Joi to Zod transformation on all TypeScript files in the specified directory.

## Features

The codemod uses Babel to parse your TypeScript code into an Abstract Syntax Tree (AST), traverse the AST to find Joi schema validation functions, and replace them with their Zod equivalents. The transformed code is then written back to the file.

The codemod will update import statements and transform the following Joi functions to their Zod equivalents:

- `Joi.string()` -> `z.string()`
- `Joi.number()` -> `z.number()`
- `Joi.boolean()` -> `z.boolean()`
- `Joi.object()` -> `z.object()`
- `Joi.array()` -> `z.array()`
- `Joi.date()` -> `z.date()`
- `Joi.any()` -> `z.any()`
- `Joi.unknown()` -> `z.unknown()`
- `Joi.undefined()` -> `z.undefined()`
- `Joi.null()` -> `z.null()`
- `Joi.void()` -> `z.void()`
- `Joi.never()` -> `z.never()`
- `Joi.symbol()` -> `z.symbol()`
- `Joi.bigint()` -> `z.bigint()`

Additionally, this codemod updates import statements from `import Joi from 'joi'` to `import { z } from 'zod'`.

## Issues

I probably forgot a ton of stuff here so create a new issue/PR if you're ready to do the needful
