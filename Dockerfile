FROM mhart/alpine-node:8

LABEL description "Slack Incident Management"

WORKDIR /code

ENV SLACK_TOKEN=""

VOLUME [ "/code/database" ]

RUN apk add --no-cache \
  git

COPY package.json /code
COPY yarn.lock /code
COPY tsconfig.json /code

RUN yarn

COPY src /code/src

RUN yarn build

CMD node src/index.js
