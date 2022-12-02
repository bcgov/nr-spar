ARG VARIANT=10
FROM node:${VARIANT}
LABEL maintainer="Paulo Gomes da Cruz Junior <paulo.cruz@encora.com>"

RUN mkdir -p /opt/data
RUN chown -R node:node /opt/data
RUN chmod 755 /opt/data

RUN apk add --update sudo
RUN apk --update add net-tools zip git
RUN npm install -g typescript pm2 serve

ARG GITUSER
ARG GITMAIL

ADD consolerc /consolerc.sh
RUN cat /consolerc.sh >> /etc/profile

RUN git config --global user.name "${GITUSER}"
RUN git config --global user.email "${GITMAIL}"

