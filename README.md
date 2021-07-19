# bulk-scheduler
A BASE utility to bulk schedule content

## Requirements
- Node.JS >= v12.x
- Write access to the relevant BASE MongoDB server

## Usage
1. Check out this repository
2. Execute `yarn install` from the project root
3. Create a `.env` file at the project root defining the `TENANT_KEY` and `MONGO_DSN`
4. Execute `yarn start` to boot the scheduler CLI
5. Select the relevant product, section, and option from the prompts
6. Select content types to limit by, if necessary
7. Input additional query parameters, if necessary (in JSON format)
