# UAS-Flugbuch – PocketBase (Datenbank, Anmeldung, Dateien) + Web-App
FROM alpine:3.20
ARG PB_VERSION=0.40.5
RUN apk add --no-cache ca-certificates unzip wget \
 && wget -q -O /tmp/pb.zip https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
 && unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip && chmod +x /pb/pocketbase
COPY pb_migrations /pb/pb_migrations
COPY pb_hooks /pb/pb_hooks
COPY pb_public /pb/pb_public
# Daten liegen in /pb/pb_data – dort muss die dauerhafte Festplatte eingehängt sein.
ENV PB_DATA=/pb/pb_data
EXPOSE 8080
CMD ["sh", "-c", "exec /pb/pocketbase serve --http=0.0.0.0:${PORT:-8080} --dir=${PB_DATA} --migrationsDir=/pb/pb_migrations --hooksDir=/pb/pb_hooks --publicDir=/pb/pb_public"]
