#!/bin/ksh

if [ "$#" -ne 1 ]; then
  echo "deploy script needs 1 arguments: <application>"
  exit 1
fi

CURRENT_PATH=`pwd`
option=$1

# build hadoop
build_hadoop(){
  cd sitesearch-hadoop
  chmod +x ./build.sh
  ./build.sh
  cd ${CURRENT_PATH}
}

#build nutch
build_nutch(){
  echo "here";
  cd sitesearch-nutch
  chmod +x ./build.sh
  ./build.sh
  cd ${CURRENT_PATH}
}

#build oozie
build_oozie(){
  cd sitesearch-oozie
  chmod +x ./build.sh
  ./build.sh
  cd ${CURRENT_PATH}
}

#build web
build_web(){
  cd sitesearch-web
  npm install
  ng build -prod
  cd ${CURRENT_PATH}
}


case $option in
   "nutch") build_nutch;;
   "hadoop") build_hadoop;;
   "oozie") build_oozie;;
   "all")build_hadoop;build_nutch;build_oozie;;
   *) echo "Sorry, Enter an option.";;
esac
