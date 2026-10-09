#!/bin/bash
set -e

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
    printf "  syntax: deployReact.sh -k <pem key file> -h <hostname> -s <service>\n\n"
    exit 1
fi

printf "\n----> Building React application.\n"
npm run build

printf "\n----> Deploying $service to $hostname.\n"

# Remove previous production files
ssh -i "$key" ubuntu@"$hostname" << ENDSSH
mkdir -p services/${service}/public
rm -rf services/${service}/public/*
ENDSSH

# Upload Vite production build
printf "\n----> Uploading production files.\n"
scp -r -i "$key" dist/. ubuntu@"$hostname":services/"$service"/public/

printf "\n----> Deployment complete!\n"