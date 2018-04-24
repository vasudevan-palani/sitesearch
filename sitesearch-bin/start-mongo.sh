. ./env.sh

CURRENT_PATH=`pwd`

#mongo
${MONGODB_HOME}/bin/mongod -dbpath ${MONGODB_DATA_PATH}
