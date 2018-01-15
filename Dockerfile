FROM mhart/alpine-node:8

LABEL description "Slack Standup Bot"

WORKDIR /code

ENV SLACK_TOKEN="xoxb-1234567890-abcdefghjkl"

COPY package.json /code
COPY yarn.lock /code
COPY tsconfig.json /code
COPY src /code/src

RUN yarn \
  && yarn build \
  && yarn --prod

CMD node src/index.js