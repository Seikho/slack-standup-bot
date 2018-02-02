FROM mhart/alpine-node:8

LABEL description "Slack Serenity Bot"

WORKDIR /code

ENV SLACK_TOKEN=""

VOLUME [ "/code/database" ]

RUN apk add --no-cache \
  git

COPY package.json /code
COPY yarn.lock /code
COPY tsconfig.json /code
COPY src /code/src

RUN yarn \
  && yarn build \
  && yarn --prod

CMD node src/index.js
