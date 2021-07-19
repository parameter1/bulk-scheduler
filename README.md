# bulk-scheduler
A BASE utility to bulk schedule content

## Requirements
- Node.JS >= v12.x
- Write access to the relevant BASE MongoDB server

## Usage
1. Check out this repository
2. Execute `yarn install` from the project root
3. Create a `.env` file at the project root defining the `MONGO_DSN`
4. Execute `yarn start` to boot the scheduler CLI
5. Select the relevant tenant key, product, section, and option from the prompts
6. Select content types to limit by, if necessary
7. Input additional query parameters, if necessary (in JSON format)

https://user-images.githubusercontent.com/1778222/126207292-920f1ef4-fa5e-4cf2-8986-b7a6a69c9494.mov
