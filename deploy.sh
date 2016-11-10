set +e
docker rm $(docker stop $(docker ps -a -q --filter ancestor=brol --format="{{.ID}}"))
set -e
docker build -t brol .
docker run --publish 27017:27017 --publish=3000:3000 --detach brol
