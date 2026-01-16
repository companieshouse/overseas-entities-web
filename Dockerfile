FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-24

WORKDIR /opt
COPY dist ./package.json ./package-lock.json docker_start.sh ./
COPY node_modules ./node_modules/

CMD ["./docker_start.sh"]

EXPOSE 3000
