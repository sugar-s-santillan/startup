#!/usr/bin/env bash
set -euo pipefail
umask 077

key=""
hostname=""
service=""

while getopts k:h:s: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deployService.sh -k <pem key file> -h <hostname> -s <service>\n\n"
    exit 1
fi

printf "\n----> Deploying React bundle $service to $hostname with $key\n"

# Check configuration before packaging or contacting the server.
if [[ ! -f service/dbConfig.json ]]; then
    printf 'Missing service/dbConfig.json. See README.md for Atlas setup.\n' >&2
    exit 1
fi

# Step 1
printf "\n----> Build the distribution package\n"
rm -rf build
mkdir build
npm ci # use the reviewed lockfile
npm run build # build the React front end
cp -rf dist build/public # move the React front end to the target distribution
cp service/*.js build # move the back end service to the target distribution
cp service/package.json service/package-lock.json build
cp service/dbConfig.json build
chmod 600 build/dbConfig.json

# Step 2
printf "\n----> Clearing out previous distribution on the target\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
set -e
rm -rf services/${service}
mkdir -p services/${service}
ENDSSH

# Step 3
printf "\n----> Copy the distribution package to the target\n"
scp -r -i "$key" build/* ubuntu@$hostname:services/$service

# Step 4
printf "\n----> Deploy the service on the target\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
set -e
bash -i
cd services/${service}
npm ci --omit=dev
chmod 600 dbConfig.json
NODE_ENV=production pm2 restart ${service} --update-env
ENDSSH

# Step 5
printf "\n----> Removing local copy of the distribution package\n"
rm -rf build
rm -rf dist