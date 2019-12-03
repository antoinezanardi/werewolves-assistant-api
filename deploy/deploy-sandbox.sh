#!/usr/bin/env bash
eval "$(ssh-agent -s)"
if [ ! -d ~/.ssh ]; then mkdir ~/.ssh; fi
cp ./deploy/deploy-key ~/.ssh/deploy-key
chmod 600 ~/.ssh/deploy-key
ssh-add ~/.ssh/deploy-key
git remote add deploy ssh://root@vps514431.ovh.net/home/git/werewolves-assistant-api.git/staging
git push deploy staging