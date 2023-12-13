FROM alpine
COPY ./start.sh ./

RUN passwd -d root

RUN apk add --no-cache openssh-server
RUN apk add --no-cache bash
RUN apk add --no-cache git

RUN echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
RUN echo "PermitEmptyPasswords yes" >> /etc/ssh/sshd_config
RUN echo "StrictModes yes" >> /etc/ssh/sshd_config

RUN echo "ssh" >> /etc/securetty

CMD ["bash", "start.sh"]
